import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import OurStory from "@/models/OurStory";

export const dynamic = "force-dynamic";

// GET: Retrieve our story
export async function GET() {
  try {
    await dbConnect();
    const ourStory = await OurStory.findOne().sort({ updatedAt: -1 });
    return NextResponse.json(ourStory || {});
  } catch (error) {
    console.error("Failed to fetch our story:", error);
    return NextResponse.json({ error: "Failed to fetch our story" }, { status: 500 });
  }
}

// POST: Add story image + year
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.imageUrl || !body.imagePublicId || !body.startedYear || !body.description) {
      return NextResponse.json(
        { error: "imageUrl, imagePublicId, startedYear, and description are required" },
        { status: 400 }
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

    return NextResponse.json(ourStory, { status: 201 });
  } catch (error) {
    console.error("Failed to create our story:", error);
    return NextResponse.json({ error: "Failed to create our story" }, { status: 500 });
  }
}
