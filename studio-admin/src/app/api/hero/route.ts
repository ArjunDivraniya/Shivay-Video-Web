import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Hero from "@/models/Hero";
import { handleOptions, createCorsResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

// OPTIONS: Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

// GET: Retrieve hero image
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const hero = await Hero.findOne().sort({ updatedAt: -1 });
    return createCorsResponse(hero || {}, 200, request);
  } catch (error) {
    console.error("Failed to fetch hero:", error);
    return createCorsResponse({ error: "Failed to fetch hero" }, 500, request);
  }
}

// POST: Upload new hero image or update styles
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.imageUrl || !body.imagePublicId) {
      return NextResponse.json(
        { error: "imageUrl and imagePublicId are required" },
        { status: 400 }
      );
    }

    // Delete existing hero images (only keep one)
    await Hero.deleteMany({});

    const hero = await Hero.create({
      imageUrl: body.imageUrl,
      imagePublicId: body.imagePublicId,
      mobileImageUrl: body.mobileImageUrl,
      mobileImagePublicId: body.mobileImagePublicId,
      title: body.title || "Shivay Video",
      subtitle: body.subtitle || "Where emotions become timeless frames",
      location: body.location || "Junagadh • Gujarat",
      styles: body.styles || {
        textColor: "#ffffff",
        overlayOpacity: 0.5,
        justifyContent: "flex-center",
        alignItems: "flex-center",
        verticalSpacing: 0,
      },
    });

    return createCorsResponse(hero, 201, req);
  } catch (error) {
    console.error("Failed to create hero:", error);
    return createCorsResponse({ error: "Failed to create hero" }, 500, req);
  }
}
