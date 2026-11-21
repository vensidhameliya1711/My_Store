import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({
    success: true,
    message: "Logout Successful",
  });

  response.cookies.set("access_token", "", {
    expires: new Date(0),
    path: "/",
  });

  response.cookies.set("user_role", "", {
    expires: new Date(0),
    path: "/",
  });

  return response;
}

export async function POST() {
  return GET();
}