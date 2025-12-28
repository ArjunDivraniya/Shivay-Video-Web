import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate against environment variables
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error("Missing Admin Credentials in .env"); // Helpful for debugging logs
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Check credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate token
    const token = signToken({ 
      sub: "admin", 
      email: ADMIN_EMAIL, 
      role: "admin" 
    });

    const response = NextResponse.json({ 
      email: ADMIN_EMAIL, 
      role: "admin", 
      success: true 
    });
    
    // FIX: Set 'secure' to true in production
    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: isProduction, // true on Vercel (HTTPS), false on localhost
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 400 });
  }
}