import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import About from "@/models/About";
import { handleOptions, createCorsResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

// OPTIONS: Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

// GET: Fetch about data
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const about = await About.findOne();
    if (!about) {
      return createCorsResponse({ error: "About data not found" }, 404, request);
    }
    return createCorsResponse(about, 200, request);
  } catch (error) {
    console.error("Failed to fetch about data:", error);
    return createCorsResponse({ error: "Failed to fetch about data" }, 500, request);
  }
}

// POST: Create about data
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Check if about data already exists
    const existingAbout = await About.findOne();
    if (existingAbout) {
      return NextResponse.json(
        { error: "About data already exists. Use PUT to update." },
        { status: 400 }
      );
    }

    if (
      typeof body.experienceYears !== "number" ||
      typeof body.weddingsCompleted !== "number" ||
      typeof body.destinations !== "number" ||
      typeof body.happyCouples !== "number"
    ) {
      return NextResponse.json(
        { error: "experienceYears, weddingsCompleted, destinations, and happyCouples must be numbers" },
        { status: 400 }
      );
    }

    const about = await About.create({
      experienceYears: body.experienceYears,
      weddingsCompleted: body.weddingsCompleted,
      destinations: body.destinations,
      happyCouples: body.happyCouples,
      images: body.images || [],
    });

    return createCorsResponse(about, 201, req);
  } catch (error) {
    console.error("Failed to create about data:", error);
    return createCorsResponse({ error: "Failed to create about data" }, 500, req);
  }
}
