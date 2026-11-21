import connectDB from "@/lib/mongodb";
import Wishlist from "@/model/Wishlist";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || userId.length !== 24) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing userId" },
        { status: 400 }
      );
    }

    const wishlistDoc = await Wishlist.findOne({ userId });

    return NextResponse.json({
      success: true,
      items: wishlistDoc ? wishlistDoc.items : [],
    });
  } catch (error) {
    console.error("GET Wishlist Error:", error);
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
    const { userId, items } = body;

    if (!userId || userId.length !== 24) {
      return NextResponse.json(
        { success: false, message: "Invalid userId" },
        { status: 400 }
      );
    }

    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { items: items || [] },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Wishlist updated successfully",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    console.error("POST Wishlist Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
