import connectDB from "@/lib/mongodb";
import Review from "@/model/Review";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Review ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const replyText = body.reply || body.adminReply;
    const repliedBy = body.repliedBy || "MyStore Support Team";

    if (!replyText || !replyText.trim()) {
      return NextResponse.json(
        { success: false, message: "Please enter a reply message" },
        { status: 400 }
      );
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      {
        adminReply: replyText.trim(),
        isReplied: true,
        repliedAt: new Date(),
        repliedBy: repliedBy,
      },
      { new: true }
    );

    if (!updatedReview) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin response saved and published successfully!",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Admin review reply error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit reply" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Review ID is required" },
        { status: 400 }
      );
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      {
        adminReply: "",
        isReplied: false,
        repliedAt: null,
      },
      { new: true }
    );

    if (!updatedReview) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin reply removed successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Delete review reply error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
