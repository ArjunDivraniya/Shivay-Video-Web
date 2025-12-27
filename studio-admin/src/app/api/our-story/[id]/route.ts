import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import OurStory from "@/models/OurStory";

// PUT: Update image/year
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id } = params;

    const updateData: any = {};
    if (body.imageUrl) updateData.imageUrl = body.imageUrl;
    if (body.imagePublicId) updateData.imagePublicId = body.imagePublicId;
    if (body.startedYear !== undefined) updateData.startedYear = body.startedYear;
    if (body.description !== undefined) updateData.description = body.description;

    const ourStory = await OurStory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!ourStory) {
      return NextResponse.json({ error: "Our story not found" }, { status: 404 });
    }

    return NextResponse.json(ourStory);
  } catch (error) {
    console.error("Failed to update our story:", error);
    return NextResponse.json({ error: "Failed to update our story" }, { status: 500 });
  }
}

// DELETE: Delete our story
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;

    const ourStory = await OurStory.findByIdAndDelete(id);

    if (!ourStory) {
      return NextResponse.json({ error: "Our story not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Our story deleted successfully" });
  } catch (error) {
    console.error("Failed to delete our story:", error);
    return NextResponse.json({ error: "Failed to delete our story" }, { status: 500 });
  }
}
