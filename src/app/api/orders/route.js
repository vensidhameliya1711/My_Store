import connectDB from "@/lib/mongodb";
import Order from "@/model/Order";
import Product from "@/model/Products";
import User from "@/model/User"; // Ensure User is loaded for population
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let query = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }

    const orders = await Order.find(query)
      .populate("userId", "firstName lastName email phone")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET Orders error:", error);
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
      userId,
      orderId,
      items,
      subtotal,
      discount,
      shipping,
      tax,
      totalAmount,
      customer,
      paymentMethod,
      paymentType,
      status,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "No items in order" },
        { status: 400 }
      );
    }

    // Validate that none of the ordered products are Out of Stock in DB
    const productIds = items
      .map((i) => i.productId || i.id || i._id)
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

    if (productIds.length > 0) {
      const dbProducts = await Product.find({ _id: { $in: productIds } }).lean();
      const outOfStockItem = dbProducts.find((p) => p.inStock === false);
      if (outOfStockItem) {
        return NextResponse.json(
          {
            success: false,
            message: `Product "${outOfStockItem.name}" is currently Out of Stock and cannot be ordered.`,
          },
          { status: 400 }
        );
      }
    }

    const validUserId = userId && mongoose.Types.ObjectId.isValid(userId) ? userId : null;
    const resolvedPaymentMethod = paymentMethod || "upi";
    const resolvedPaymentType =
      paymentType ||
      (resolvedPaymentMethod === "cod"
        ? "Cash on Delivery (COD)"
        : "UPI Online Payment");

    const newOrderDoc = await Order.create({
      userId: validUserId,
      orderId: orderId || "ORD-" + Math.floor(100000 + Math.random() * 900000),
      items,
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      shipping: Number(shipping) || 0,
      tax: Number(tax) || 0,
      totalAmount: Number(totalAmount) || 0,
      customer,
      paymentMethod: resolvedPaymentMethod,
      paymentType: resolvedPaymentType,
      status: status || "Processing",
    });

    console.log("NEW ORDER CREATED IN DB:", newOrderDoc.orderId);

    return NextResponse.json({
      success: true,
      order: newOrderDoc,
    });
  } catch (error) {
    console.error("POST Order error:", error);

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
    const { orderId, status } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    const filter = mongoose.Types.ObjectId.isValid(orderId)
      ? { $or: [{ _id: orderId }, { orderId: orderId }] }
      : { orderId: orderId };

    const updatedOrder = await Order.findOneAndUpdate(
      filter,
      { $set: { status } },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("PATCH Order error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}