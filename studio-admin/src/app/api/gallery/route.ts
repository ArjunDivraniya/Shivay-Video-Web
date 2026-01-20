import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import { handleOptions, createCorsResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

// OPTIONS: Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

// GET: Get all gallery images
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const images = await Gallery.find().sort({ createdAt: -1 });
    return createCorsResponse(images, 200, request);
  } catch (error) {
    console.error("Failed to fetch gallery:", error);
    return createCorsResponse({ error: "Failed to fetch gallery" }, 500, request);
  }
}

// POST: Upload photo
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.imageUrl || !body.imagePublicId || !body.category) {
      return createCorsResponse(
        { error: "imageUrl, imagePublicId, and category are required" },
        400,
        req
      );
    }

    const image = await Gallery.create({
      imageUrl: body.imageUrl,
      imagePublicId: body.imagePublicId,
      category: body.category,
      serviceType: body.serviceType || "",
    });

    return createCorsResponse(image, 201, req);
  } catch (error) {
    console.error("Failed to upload photo:", error);
    return createCorsResponse({ error: "Failed to upload photo" }, 500, req);
  }
}
