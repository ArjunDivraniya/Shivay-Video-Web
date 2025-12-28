import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/_next",
  "/favicon",
  "/manifest.json",
  "/android-icon",
  "/ms-icon",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

function getToken(req: NextRequest) {
  return req.cookies.get("admin_token")?.value;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = getToken(req);

  // Redirect logged-in users from login page to dashboard
  if (pathname === "/login" && token) {
    try {
      await verifyToken(token);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch (error) {
      // Invalid token, allow login page load
    }
  }

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // All API routes require authentication
  if (pathname.startsWith("/api")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      await verifyToken(token);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Protect admin pages (Dashboard, etc.)
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await verifyToken(token);
    return NextResponse.next();
  } catch (error) {
    console.error("Token verification failed:", error);
    // Token is invalid/expired, redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};