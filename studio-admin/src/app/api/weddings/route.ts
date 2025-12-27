import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WeddingStory from "@/models/WeddingStory";

export const dynamic = "force-dynamic";

// GET: Get all wedding stories
export async function GET() {
  try {
    await dbConnect();
    const weddings = await WeddingStory.find().sort({ createdAt: -1 });
    return NextResponse.json(weddings);
  } catch (error) {
    console.error("Failed to fetch weddings:", error);
    return NextResponse.json({ error: "Failed to fetch weddings" }, { status: 500 });
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

    return NextResponse.json(wedding, { status: 201 });
  } catch (error) {
    console.error("Failed to create wedding:", error);
    return NextResponse.json({ error: "Failed to create wedding" }, { status: 500 });
  }
}
