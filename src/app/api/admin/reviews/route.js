import connectDB from "@/lib/mongodb";
import Review from "@/model/Review";
import Product from "@/model/Products"; // Make sure model is registered
import User from "@/model/User";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const rating = searchParams.get("rating") || "all";
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    // Base filter
    let query = {};
    if (status === "trash") {
      query.isDeleted = true;
    } else {
      query.isDeleted = { $ne: true };
      if (status === "pending") {
        query.isReplied = false;
      } else if (status === "replied") {
        query.isReplied = true;
      }
    }

    if (rating !== "all" && !isNaN(Number(rating))) {
      query.rating = Number(rating);
    }

    const allActiveReviews = await Review.find({ isDeleted: { $ne: true } })
      .populate("productId", "name image price category inStock")
      .populate("userId", "firstName lastName email profilePic")
      .sort({ createdAt: -1 })
      .lean();

    const totalActive = allActiveReviews.length;
    const pendingCount = allActiveReviews.filter((r) => !r.isReplied).length;
    const repliedCount = allActiveReviews.filter((r) => r.isReplied).length;
    const trashCount = await Review.countDocuments({ isDeleted: true });

    const totalScore = allActiveReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    const averageRating = totalActive > 0 ? Number((totalScore / totalActive).toFixed(1)) : 0;

    let reviews = await Review.find(query)
      .populate("productId", "name image price category inStock")
      .populate("userId", "firstName lastName email profilePic")
      .sort({ createdAt: -1 })
      .lean();

    // Client-side text search filter for populated fields & review text
    if (search) {
      reviews = reviews.filter((rev) => {
        const prodName = rev.productId?.name?.toLowerCase() || "";
        const userName = rev.userName?.toLowerCase() || "";
        const userEmail = rev.userEmail?.toLowerCase() || "";
        const comment = rev.comment?.toLowerCase() || "";
        const title = rev.title?.toLowerCase() || "";
        const orderId = rev.orderId?.toLowerCase() || "";

        return (
          prodName.includes(search) ||
          userName.includes(search) ||
          userEmail.includes(search) ||
          comment.includes(search) ||
          title.includes(search) ||
          orderId.includes(search)
        );
      });
    }

    return NextResponse.json({
      success: true,
      reviews,
      counts: {
        total: totalActive,
        pending: pendingCount,
        replied: repliedCount,
        trash: trashCount,
        averageRating,
      },
    });
  } catch (error) {
    console.error("GET Admin Reviews error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const permanent = searchParams.get("permanent") === "true";

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Review ID is required" },
        { status: 400 }
      );
    }

    if (permanent) {
      await Review.findByIdAndDelete(id);
      return NextResponse.json({
        success: true,
        message: "Review permanently deleted",
      });
    }

    const updated = await Review.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Review moved to trash",
      data: updated,
    });
  } catch (error) {
    console.error("DELETE Review error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Review ID is required" },
        { status: 400 }
      );
    }

    if (action === "restore") {
      const updated = await Review.findByIdAndUpdate(
        id,
        { isDeleted: false },
        { new: true }
      );
      return NextResponse.json({
        success: true,
        message: "Review restored successfully",
        data: updated,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH Review error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
