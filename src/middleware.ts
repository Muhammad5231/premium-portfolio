import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "portfolio_admin_token";
const USER_AUTH_COOKIE_NAME = "portfolio_user_token";
const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || "fallback_secret_editorial_portfolio_system_key_2025";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: any) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  const isAdminPath = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAuthApi = pathname.startsWith("/api/admin/auth");

  const adminToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let isAdminAuthenticated = false;

  if (adminToken) {
    try {
      await jwtVerify(adminToken, secretKey, { algorithms: ["HS256"] });
      isAdminAuthenticated = true;
    } catch {
      isAdminAuthenticated = false;
    }
  }

  // Handle /admin/login access
  if (isLoginPage) {
    if (isAdminAuthenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Handle protected /admin pages
  if (isAdminPath && !isAdminAuthenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle protected /api/admin APIs
  if (isAdminApi && !isAuthApi && !isAdminAuthenticated) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  // Protect authenticated user pages
  const isUserProtectedPage =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/notifications");

  const isUserProtectedApi =
    (pathname.startsWith("/api/messages") ||
      pathname.startsWith("/api/notifications")) &&
    !pathname.startsWith("/api/admin");

  const userToken = request.cookies.get(USER_AUTH_COOKIE_NAME)?.value;
  let isUserAuthenticated = false;

  if (userToken) {
    try {
      await jwtVerify(userToken, secretKey, { algorithms: ["HS256"] });
      isUserAuthenticated = true;
    } catch {
      isUserAuthenticated = false;
    }
  }

  if (isUserProtectedPage && !isUserAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isUserProtectedApi && !isUserAuthenticated) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/profile/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/api/messages/:path*",
    "/api/notifications/:path*",
  ],
};
