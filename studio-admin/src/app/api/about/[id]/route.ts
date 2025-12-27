import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import About from "@/models/About";

// PUT: Update about stats
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id } = await params;

    const updateData: any = {};
    if (typeof body.experienceYears === "number") updateData.experienceYears = body.experienceYears;
    if (typeof body.weddingsCompleted === "number") updateData.weddingsCompleted = body.weddingsCompleted;
    if (typeof body.destinations === "number") updateData.destinations = body.destinations;
    if (typeof body.happyCouples === "number") updateData.happyCouples = body.happyCouples;
    if (Array.isArray(body.images)) updateData.images = body.images;

    const about = await About.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!about) {
      return NextResponse.json({ error: "About data not found" }, { status: 404 });
    }

    return NextResponse.json(about);
  } catch (error) {
    console.error("Failed to update about data:", error);
    return NextResponse.json({ error: "Failed to update about data" }, { status: 500 });
  }
}

// DELETE: Delete about data
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const about = await About.findByIdAndDelete(id);

    if (!about) {
      return NextResponse.json({ error: "About data not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "About data deleted successfully" });
  } catch (error) {
    console.error("Failed to delete about data:", error);
    return NextResponse.json({ error: "Failed to delete about data" }, { status: 500 });
  }
}
