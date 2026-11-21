import connectDB from "@/lib/mongodb";
import User from "@/model/User";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const userId = cookieStore.get("access_token")?.value;
    const userData = await req.json();

    const query = userId ? { _id: userId } : { email: userData.email };

    const updateFields = {};
    if (userData.firstName !== undefined) updateFields.firstName = userData.firstName;
    if (userData.lastName !== undefined) updateFields.lastName = userData.lastName;
    if (userData.country !== undefined) updateFields.country = userData.country;
    if (userData.phone !== undefined) updateFields.phone = userData.phone;
    if (userData.profilePic !== undefined) updateFields.profilePic = userData.profilePic;

    const user = await User.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile Updated Successfully",
      user,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}