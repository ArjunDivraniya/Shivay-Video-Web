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

// Public GET endpoints (read-only for portfolio site)
const PUBLIC_GET_APIS = [
  "/api/hero",
  "/api/services",
  "/api/gallery",
  "/api/films",
  "/api/about",
  "/api/testimonials",
  "/api/weddings",
  "/api/stories",
  "/api/reviews",
  "/api/reels",
  "/api/sections",
  "/api/settings",
  "/api/footer",
  "/api/our-story",
  "/api/media",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

function isPublicGetApi(pathname: string, method: string) {
  return method === "GET" && PUBLIC_GET_APIS.some((path) => pathname.startsWith(path));
}

function getToken(req: NextRequest) {
  return req.cookies.get("admin_token")?.value;
}

function addCorsHeaders(response: NextResponse, origin?: string | null) {
  // Default allowed origins for production and local development
  const defaultOrigins = [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://shivay-video.vercel.app',
    'https://shivay-video-admin.vercel.app'
  ];
  
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : defaultOrigins;

  // Check if origin is in allowed list
  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  } else {
    // For public GET APIs, allow all origins
    response.headers.set("Access-Control-Allow-Origin", "*");
  }

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = getToken(req);
  const method = req.method;
  const origin = req.headers.get("origin");

  // Handle CORS preflight requests
  if (method === "OPTIONS") {
    return addCorsHeaders(new NextResponse(null, { status: 200 }), origin);
  }

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
    return addCorsHeaders(NextResponse.next(), origin);
  }

  // Allow public GET requests to API (for portfolio site)
  if (isPublicGetApi(pathname, method)) {
    return addCorsHeaders(NextResponse.next(), origin);
  }

  // All other API routes require authentication (POST, PUT, DELETE)
  if (pathname.startsWith("/api")) {
    if (!token) {
      return addCorsHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        origin
      );
    }
    try {
      await verifyToken(token);
      return addCorsHeaders(NextResponse.next(), origin);
    } catch (error) {
      return addCorsHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        origin
      );
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