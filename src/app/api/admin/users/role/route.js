import connectDB from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, message: "User ID and new Role are required" },
        { status: 400 }
      );
    }

    if (!["admin", "user"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Role must be either 'admin' or 'user'" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User role successfully updated to '${role}'!`,
      user: {
        id: updatedUser._id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user role" },
      { status: 500 }
    );
  }
}
