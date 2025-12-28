import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get("cookie");
    const token = cookie
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("admin_token="))
      ?.split("=")[1];

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // FIX 1: Added 'await' because verifyToken is now async
    const payload = await verifyToken(token);

    // FIX 2: Removed Database call.
    // Since we are using Environment Variables for login, we trust the token data directly.
    // This matches the "sub: 'admin'" we set in the login route.
    
    return NextResponse.json({ 
      email: payload.email, 
      role: payload.role 
    });
  } catch (error: any) {
    console.error("Auth check error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}