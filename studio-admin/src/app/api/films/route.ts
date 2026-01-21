import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Film from "@/models/Film";
import { handleOptions, createCorsResponse } from "@/lib/cors";
import { deleteVideoAsset } from "@/lib/cloudinary";

const MAX_FILMS = 3;

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

    // Auto-delete oldest films if exceeds limit
    const totalCount = await Film.countDocuments();
    if (totalCount > MAX_FILMS) {
      const excessCount = totalCount - MAX_FILMS;
      // Get oldest entries to delete
      const oldestFilms = await Film.find()
        .sort({ createdAt: 1 })
        .limit(excessCount);
      
      // Delete each old film and its Cloudinary video
      for (const oldFilm of oldestFilms) {
        // Delete video from Cloudinary
        if (oldFilm.videoPublicId) {
          try {
            await deleteVideoAsset(oldFilm.videoPublicId);
          } catch (err) {
            console.error("Failed to delete old film video from Cloudinary:", err);
          }
        }
        // Delete from database
        await Film.findByIdAndDelete(oldFilm._id);
      }
      console.log(`Auto-deleted ${excessCount} old films`);
    }

    return createCorsResponse(film, 201, req);
  } catch (error) {
    console.error("Failed to create film:", error);
    return createCorsResponse({ error: "Failed to create film" }, 500, req);
  }
}
