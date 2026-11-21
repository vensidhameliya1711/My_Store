import { NextResponse } from "next/server";

export default function middleware(request) {
  const token = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("user_role")?.value;
  const pathname = request.nextUrl.pathname;

  // 1. ADMIN ROUTES PROTECTION
  const isAdminRoute = pathname.startsWith("/admin");
  if (isAdminRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== "admin") {
      // Normal user trying to access admin panel -> redirect to storefront
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  // 2. USER PROTECTED ROUTES
  const userProtectedRoutes = [
    "/products",
    "/cart",
    "/wishlist",
    "/orders",
    "/about",
    "/contact",
    "/profile",
    "/home",
  ];

  const isUserProtectedRoute = userProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isUserProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/products/:path*",
    "/cart/:path*",
    "/wishlist/:path*",
    "/orders/:path*",
    "/login",
    "/registration",
    "/about",
    "/contact",
    "/profile",
    "/welcome",
    "/home",
    "/",
  ],
};
