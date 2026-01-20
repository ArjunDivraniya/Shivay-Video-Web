import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Footer from "@/models/Footer";
import { handleOptions, createCorsResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

// OPTIONS: Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

// GET: Fetch footer data
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const footer = await Footer.findOne();
    if (!footer) {
      return createCorsResponse({ error: "Footer data not found" }, 404, request);
    }
    return createCorsResponse(footer, 200, request);
  } catch (error) {
    console.error("Failed to fetch footer data:", error);
    return createCorsResponse({ error: "Failed to fetch footer data" }, 500, request);
  }
}

// POST: Create footer data
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Check if footer data already exists
    const existingFooter = await Footer.findOne();
    if (existingFooter) {
      return createCorsResponse(
        { error: "Footer data already exists. Use PUT to update." },
        400,
        req
      );
    }

    if (!body.phone || !body.email) {
      return createCorsResponse(
        { error: "phone and email are required" },
        400,
        req
      );
    }

    const footer = await Footer.create({
      phone: body.phone,
      email: body.email,
      instagram: body.instagram || "",
      youtube: body.youtube || "",
      facebook: body.facebook || "",
    });

    return createCorsResponse(footer, 201, req);
  } catch (error) {
    console.error("Failed to create footer data:", error);
    return createCorsResponse({ error: "Failed to create footer data" }, 500, req);
  }
}
