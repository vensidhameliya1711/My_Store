import connectDB from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";

// Soft Delete
export async function DELETE(req, context) {
  await connectDB();

  const { id } = await context.params;

  await User.findByIdAndUpdate(id, {
    isDeleted: true
  });

  return NextResponse.json({
    message: "User deleted"
  });
}


// Restore
export async function PUT(req, context) {
  await connectDB();

  const { id } = await context.params;

  await User.findByIdAndUpdate(id, {
    isDeleted: false
  });

  return NextResponse.json({
    message: "User restored"
  });
}