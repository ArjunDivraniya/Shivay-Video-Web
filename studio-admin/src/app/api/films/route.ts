import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Film from "@/models/Film";

export const dynamic = "force-dynamic";

// GET: Get all films
export async function GET() {
  try {
    await dbConnect();
    const films = await Film.find().sort({ createdAt: -1 });
    return NextResponse.json(films);
  } catch (error) {
    console.error("Failed to fetch films:", error);
    return NextResponse.json({ error: "Failed to fetch films" }, { status: 500 });
  }
}

// POST: Upload new film
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.title || !body.videoUrl || !body.videoPublicId) {
      return NextResponse.json(
        { error: "title, videoUrl, and videoPublicId are required" },
        { status: 400 }
      );
    }

    const film = await Film.create({
      title: body.title,
      videoUrl: body.videoUrl,
      videoPublicId: body.videoPublicId,
    });

    return NextResponse.json(film, { status: 201 });
  } catch (error) {
    console.error("Failed to create film:", error);
    return NextResponse.json({ error: "Failed to create film" }, { status: 500 });
  }
}
