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

/**
 * FIXED CORS HEADER FUNCTION
 */
function addCorsHeaders(response: NextResponse, origin?: string | null) {
  const allowedOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'https://shivay-video.vercel.app'
  ];

  // If origin is allowed, use it. Otherwise, default to production link.
  const currentOrigin = (origin && allowedOrigins.includes(origin)) 
    ? origin 
    : "https://shivay-video.vercel.app";

  response.headers.set("Access-Control-Allow-Origin", currentOrigin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours cache for preflight
  
  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = getToken(req);
  const method = req.method;
  const origin = req.headers.get("origin");

  // 1. Handle CORS preflight (OPTIONS)
  if (method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });
    return addCorsHeaders(response, origin);
  }

  // 2. Redirect logged-in users from login to dashboard
  if (pathname === "/login" && token) {
    try {
      await verifyToken(token);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch (error) {
      // Allow login if token is invalid
    }
  }

  // 3. Handle API Routes
  if (pathname.startsWith("/api")) {
    let response: NextResponse;

    // Check if it's a public GET request
    if (isPublicGetApi(pathname, method)) {
      response = NextResponse.next();
    } else if (isPublicPath(pathname)) {
      // Other public paths (like login API)
      response = NextResponse.next();
    } else {
      // Protected API logic
      if (!token) {
        response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      } else {
        try {
          await verifyToken(token);
          response = NextResponse.next();
        } catch (error) {
          response = NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
      }
    }
    return addCorsHeaders(response, origin);
  }

  // 4. Protect Admin Dashboard Pages
  if (!isPublicPath(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      await verifyToken(token);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};