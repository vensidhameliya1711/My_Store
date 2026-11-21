import connectDB from "@/lib/mongodb";
import Review from "@/model/Review";
import Order from "@/model/Order";
import Product from "@/model/Products";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const orderId = searchParams.get("orderId");
    const userId = searchParams.get("userId");
    const userEmail = searchParams.get("userEmail");

    // Case 1: Fetch all reviews by orderId for checking existing review status in My Orders
    if (orderId && !productId) {
      const query = { orderId, isDeleted: { $ne: true } };
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        query.userId = userId;
      }
      const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();
      return NextResponse.json({
        success: true,
        reviews,
      });
    }

    // Case 2: Fetch reviews for a specific Product
    if (productId) {
      let filter = { isDeleted: { $ne: true }, status: { $ne: "rejected" } };
      if (mongoose.Types.ObjectId.isValid(productId)) {
        filter.productId = productId;
      } else {
        return NextResponse.json({
          success: true,
          reviews: [],
          canReview: false,
          userReview: null,
          stats: {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          },
        });
      }

      const reviews = await Review.find(filter)
        .sort({ createdAt: -1 })
        .lean();

      const totalReviews = reviews.length;
      const totalScore = reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
      const averageRating = totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(1)) : 0;

      const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach((r) => {
        const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
        ratingCounts[star] = (ratingCounts[star] || 0) + 1;
      });

      const ratingPercentages = {};
      [5, 4, 3, 2, 1].forEach((star) => {
        ratingPercentages[star] =
          totalReviews > 0 ? Math.round((ratingCounts[star] / totalReviews) * 100) : 0;
      });

      // Check if the current user has purchased & received this product
      let canReview = false;
      let userReview = null;
      let eligibleOrderId = "";

      if (userId || userEmail) {
        const userQueries = [];
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
          userQueries.push({ userId });
        }
        if (userEmail && userEmail.trim()) {
          userQueries.push({ "customer.email": userEmail.trim().toLowerCase() });
        }

        if (userQueries.length > 0) {
          // Find orders with Delivered status
          const deliveredOrders = await Order.find({
            $or: userQueries,
            status: { $regex: /^delivered$/i },
          }).lean();

          const pIdStr = productId.toString();
          for (const order of deliveredOrders) {
            const hasItem = order.items?.some((item) => {
              const itemPId = (item.productId || item.id || item._id || "").toString();
              return itemPId === pIdStr;
            });

            if (hasItem) {
              canReview = true;
              eligibleOrderId = order.orderId || order._id?.toString() || "";
              break;
            }
          }

          // Check if this user already wrote a review for this product
          const userRevQueries = [];
          if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            userRevQueries.push({ userId });
          }
          if (userEmail && userEmail.trim()) {
            userRevQueries.push({ userEmail: userEmail.trim().toLowerCase() });
          }

          if (userRevQueries.length > 0) {
            userReview = await Review.findOne({
              productId,
              isDeleted: { $ne: true },
              $or: userRevQueries,
            }).lean();

            if (userReview) {
              canReview = true;
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        reviews,
        canReview,
        userReview,
        eligibleOrderId,
        stats: {
          averageRating,
          totalReviews,
          ratingCounts,
          ratingPercentages,
        },
      });
    }

    // Default: fetch recent reviews
    const reviews = await Review.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("GET Reviews error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      productId,
      orderId: providedOrderId,
      userId,
      userName,
      userEmail,
      rating,
      title,
      comment,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const validProductId = mongoose.Types.ObjectId.isValid(productId) ? productId : null;
    if (!validProductId) {
      return NextResponse.json(
        { success: false, message: "Invalid Product ID" },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid rating between 1 and 5 stars" },
        { status: 400 }
      );
    }

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { success: false, message: "Please write a review comment" },
        { status: 400 }
      );
    }

    const validUserId = userId && mongoose.Types.ObjectId.isValid(userId) ? userId : null;
    const cleanUserEmail = userEmail ? userEmail.trim().toLowerCase() : "";

    // 1. Strict Purchase Verification: User must have a Delivered order containing this product
    const userOrderQueries = [];
    if (validUserId) {
      userOrderQueries.push({ userId: validUserId });
    }
    if (cleanUserEmail) {
      userOrderQueries.push({ "customer.email": cleanUserEmail });
    }

    if (userOrderQueries.length === 0 && !providedOrderId) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in to review products you have purchased.",
        },
        { status: 401 }
      );
    }

    // Find delivered orders for this user
    let matchingOrder = null;
    if (providedOrderId) {
      const orderQuery = mongoose.Types.ObjectId.isValid(providedOrderId)
        ? { $or: [{ _id: providedOrderId }, { orderId: providedOrderId }] }
        : { orderId: providedOrderId };

      matchingOrder = await Order.findOne(orderQuery).lean();
    }

    if (!matchingOrder && userOrderQueries.length > 0) {
      const deliveredOrders = await Order.find({
        $or: userOrderQueries,
        status: { $regex: /^delivered$/i },
      }).lean();

      const pIdStr = productId.toString();
      matchingOrder = deliveredOrders.find((order) =>
        order.items?.some((item) => {
          const itemPId = (item.productId || item.id || item._id || "").toString();
          return itemPId === pIdStr;
        })
      );
    }

    // If order was provided but status is not delivered
    if (matchingOrder && matchingOrder.status && !/^delivered$/i.test(matchingOrder.status)) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only write a review after your order has been successfully delivered.",
        },
        { status: 403 }
      );
    }

    // Check if an existing review exists for this user + product
    const matchCriteria = {
      productId: validProductId,
      isDeleted: { $ne: true },
      $or: [],
    };
    if (validUserId) matchCriteria.$or.push({ userId: validUserId });
    if (cleanUserEmail) matchCriteria.$or.push({ userEmail: cleanUserEmail });
    if (providedOrderId) matchCriteria.$or.push({ orderId: providedOrderId });

    let existingReview = null;
    if (matchCriteria.$or.length > 0) {
      existingReview = await Review.findOne(matchCriteria);
    }

    if (!matchingOrder && !existingReview) {
      return NextResponse.json(
        {
          success: false,
          message: "Only verified buyers who have received this product can write a review.",
        },
        { status: 403 }
      );
    }

    const resolvedOrderId =
      matchingOrder?.orderId ||
      matchingOrder?._id?.toString() ||
      existingReview?.orderId ||
      providedOrderId ||
      "";
    const isVerifiedPurchase = true;

    let savedReview;
    if (existingReview) {
      existingReview.rating = Number(rating);
      existingReview.title = title ? title.trim() : existingReview.title;
      existingReview.comment = comment.trim();
      existingReview.userName = userName || existingReview.userName;
      existingReview.userEmail = cleanUserEmail || existingReview.userEmail;
      existingReview.orderId = resolvedOrderId || existingReview.orderId;
      existingReview.isVerifiedPurchase = isVerifiedPurchase;
      savedReview = await existingReview.save();
    } else {
      savedReview = await Review.create({
        productId: validProductId,
        orderId: resolvedOrderId,
        userId: validUserId,
        userName: userName ? userName.trim() : "Verified Customer",
        userEmail: cleanUserEmail,
        rating: Number(rating),
        title: title ? title.trim() : "",
        comment: comment.trim(),
        isVerifiedPurchase,
      });
    }

    return NextResponse.json({
      success: true,
      message: existingReview
        ? "Your review has been updated successfully!"
        : "Thank you! Your review has been submitted.",
      review: savedReview,
    });
  } catch (error) {
    console.error("POST Review error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
