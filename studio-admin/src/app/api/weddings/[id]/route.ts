import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WeddingStory from "@/models/WeddingStory";

// GET: Single wedding
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const wedding = await WeddingStory.findById(id);

    if (!wedding) {
      return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
    }

    return NextResponse.json(wedding);
  } catch (error) {
    console.error("Failed to fetch wedding:", error);
    return NextResponse.json({ error: "Failed to fetch wedding" }, { status: 500 });
  }
}

// PUT: Update wedding
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id } = await params;

    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.coupleName) updateData.coupleName = body.coupleName;
    if (body.place) updateData.place = body.place;
    if (body.coverPhoto) updateData.coverPhoto = body.coverPhoto;
    if (body.gallery !== undefined) updateData.gallery = body.gallery;

    const wedding = await WeddingStory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!wedding) {
      return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
    }

    return NextResponse.json(wedding);
  } catch (error) {
    console.error("Failed to update wedding:", error);
    return NextResponse.json({ error: "Failed to update wedding" }, { status: 500 });
  }
}

// DELETE: Delete wedding
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const wedding = await WeddingStory.findByIdAndDelete(id);

    if (!wedding) {
      return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Wedding deleted successfully" });
  } catch (error) {
    console.error("Failed to delete wedding:", error);
    return NextResponse.json({ error: "Failed to delete wedding" }, { status: 500 });
  }
}
