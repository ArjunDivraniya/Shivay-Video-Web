import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gallery from "@/models/Gallery";

export const dynamic = "force-dynamic";

// GET: Get all gallery images
export async function GET() {
  try {
    await dbConnect();
    const images = await Gallery.find().sort({ createdAt: -1 });
    return NextResponse.json(images);
  } catch (error) {
    console.error("Failed to fetch gallery:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

// POST: Upload photo
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.imageUrl || !body.imagePublicId || !body.category) {
      return NextResponse.json(
        { error: "imageUrl, imagePublicId, and category are required" },
        { status: 400 }
      );
    }

    const image = await Gallery.create({
      imageUrl: body.imageUrl,
      imagePublicId: body.imagePublicId,
      category: body.category,
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Failed to upload photo:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
