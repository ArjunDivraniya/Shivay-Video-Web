import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import OurStory from "@/models/OurStory";
import { handleOptions, createCorsResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

// OPTIONS: Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

// GET: Retrieve our story
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const ourStory = await OurStory.findOne().sort({ updatedAt: -1 });
    return createCorsResponse(ourStory || {}, 200, request);
  } catch (error) {
    console.error("Failed to fetch our story:", error);
    return createCorsResponse({ error: "Failed to fetch our story" }, 500, request);
  }
}

// POST: Add story image + year
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.imageUrl || !body.imagePublicId || !body.startedYear || !body.description) {
      return createCorsResponse(
        { error: "imageUrl, imagePublicId, startedYear, and description are required" },
        400,
        req
      );
    }

    // Delete existing our story (only keep one)
    await OurStory.deleteMany({});

    const ourStory = await OurStory.create({
      imageUrl: body.imageUrl,
      imagePublicId: body.imagePublicId,
      startedYear: body.startedYear,
      description: body.description,
    });

    return createCorsResponse(ourStory, 201, req);
  } catch (error) {
    console.error("Failed to create our story:", error);
    return createCorsResponse({ error: "Failed to create our story" }, 500, req);
  }
}
