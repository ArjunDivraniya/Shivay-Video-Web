import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/_next",
  "/favicon",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

function getToken(req: NextRequest) {
  return req.cookies.get("admin_token")?.value;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = getToken(req);

  // Redirect logged-in users from login page to dashboard
  if (pathname === "/login" && token) {
    try {
      verifyToken(token);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch (error) {
      // Invalid token, allow login page
    }
  }

  // Allow public paths (only login and assets)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // All API routes require authentication
  if (pathname.startsWith("/api")) {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      verifyToken(token);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Protect admin pages
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    verifyToken(token);
    return NextResponse.next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
