import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/_next",
  "/favicon",
];

const PUBLIC_API_GET = [
  "/api/stories",
  "/api/stories/featured",
  "/api/media",
  "/api/reels",
  "/api/sections",
  "/api/testimonials",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

function isPublicApi(req: NextRequest) {
  if (req.method !== "GET") return false;
  return PUBLIC_API_GET.some((path) => req.nextUrl.pathname.startsWith(path));
}

function getToken(req: NextRequest) {
  return req.cookies.get("admin_token")?.value;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Allow public API GET endpoints
  if (pathname.startsWith("/api")) {
    if (isPublicApi(req)) return NextResponse.next();

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
  const token = getToken(req);
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
