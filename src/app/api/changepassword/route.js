import connectDB from "../../../lib/mongodb";
import User from "../../../model/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();

    const {
      email,
      currentPassword,
      newPassword,
    } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return Response.json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    return Response.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}