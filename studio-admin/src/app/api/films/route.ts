import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Film from "@/models/Film";
import { handleOptions, createCorsResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

// OPTIONS: Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

// GET: Get all films
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const films = await Film.find().sort({ createdAt: -1 });
    return createCorsResponse(films, 200, request);
  } catch (error) {
    console.error("Failed to fetch films:", error);
    return createCorsResponse({ error: "Failed to fetch films" }, 500, request);
  }
}

// POST: Upload new film
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.title || !body.category || !body.videoUrl || !body.videoPublicId) {
      return NextResponse.json(
        { error: "title, category, videoUrl, and videoPublicId are required" },
        { status: 400 }
      );
    }

    const film = await Film.create({
      title: body.title,
      category: body.category,
      serviceType: body.serviceType || "",
      videoUrl: body.videoUrl,
      videoPublicId: body.videoPublicId,
    });

    return createCorsResponse(film, 201, req);
  } catch (error) {
    console.error("Failed to create film:", error);
    return createCorsResponse({ error: "Failed to create film" }, 500, req);
  }
}
