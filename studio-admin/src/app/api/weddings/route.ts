import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WeddingStory from "@/models/WeddingStory";
import { handleOptions, createCorsResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

// OPTIONS: Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

// GET: Get all wedding stories
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const weddings = await WeddingStory.find().sort({ createdAt: -1 });
    return createCorsResponse(weddings, 200, request);
  } catch (error) {
    console.error("Failed to fetch weddings:", error);
    return createCorsResponse({ error: "Failed to fetch weddings" }, 500, request);
  }
}

// POST: Create wedding story
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.title || !body.coupleName || !body.place || !body.serviceType || !body.coverPhoto?.url || !body.coverPhoto?.publicId) {
      return NextResponse.json(
        { error: "title, coupleName, place, serviceType, and coverPhoto are required" },
        { status: 400 }
      );
    }

    const wedding = await WeddingStory.create({
      title: body.title,
      coupleName: body.coupleName,
      place: body.place,
      serviceType: body.serviceType,
      coverPhoto: body.coverPhoto,
      gallery: body.gallery || [],
    });

    return createCorsResponse(wedding, 201, req);
  } catch (error) {
    console.error("Failed to create wedding:", error);
    return createCorsResponse({ error: "Failed to create wedding" }, 500, req);
  }
}
