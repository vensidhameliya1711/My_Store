import connectDB from "@/lib/mongodb";
import User from "@/model/User";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, newPassword, confirmPassword, currentPassword, name, phone } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "New password and Confirm password do not match." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const currentUserId = cookieStore.get("access_token")?.value;
    let targetAdmin = null;

    if (currentUserId) {
      targetAdmin = await User.findById(currentUserId);
    }

    if (!targetAdmin && email) {
      targetAdmin = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!targetAdmin) {
      targetAdmin = await User.findOne({ role: "admin" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (targetAdmin) {
      if (currentPassword && targetAdmin.password) {
        const isMatch = await bcrypt.compare(currentPassword, targetAdmin.password);
        if (!isMatch) {
          return NextResponse.json(
            { success: false, message: "Current password is incorrect." },
            { status: 400 }
          );
        }
      }

      targetAdmin.password = hashedPassword;
      targetAdmin.role = "admin";
      if (name) {
        const parts = name.trim().split(" ");
        targetAdmin.firstName = parts[0] || targetAdmin.firstName;
        targetAdmin.lastName = parts.slice(1).join(" ") || targetAdmin.lastName || "Admin";
      }
      if (email) targetAdmin.email = email.toLowerCase().trim();
      if (phone) targetAdmin.phone = phone;

      await targetAdmin.save();

      return NextResponse.json({
        success: true,
        message: "Admin password updated successfully!",
        admin: {
          id: targetAdmin._id,
          name: `${targetAdmin.firstName} ${targetAdmin.lastName}`,
          email: targetAdmin.email,
          role: targetAdmin.role,
        },
      });
    } else {
      const targetEmail = email ? email.toLowerCase().trim() : "admin@mystore.com";
      const parts = (name || "System Admin").trim().split(" ");

      const newAdmin = new User({
        firstName: parts[0] || "Admin",
        lastName: parts.slice(1).join(" ") || "User",
        email: targetEmail,
        phone: phone || "+91 9999999999",
        country: "India",
        password: hashedPassword,
        role: "admin",
        isDeleted: false,
      });

      await newAdmin.save();

      return NextResponse.json({
        success: true,
        message: "New Admin account created with configured password!",
        admin: {
          id: newAdmin._id,
          name: `${newAdmin.firstName} ${newAdmin.lastName}`,
          email: newAdmin.email,
          role: newAdmin.role,
        },
      });
    }
  } catch (error) {
    console.error("Error setting admin password:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to set admin password" },
      { status: 500 }
    );
  }
}
