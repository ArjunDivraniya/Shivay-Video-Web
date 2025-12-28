import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  
  const isProduction = process.env.NODE_ENV === "production";

  // Match the attributes used in Login to ensure deletion
  response.cookies.set("admin_token", "", { 
    maxAge: 0, 
    path: "/",
    secure: isProduction, // Match the secure flag
    sameSite: "lax",      // Match the sameSite flag
    httpOnly: true
  });
  
  return response;
}