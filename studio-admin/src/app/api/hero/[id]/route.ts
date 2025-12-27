import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Hero from "@/models/Hero";

// PUT: Replace hero image
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id } = params;

    if (!body.imageUrl || !body.imagePublicId) {
      return NextResponse.json(
        { error: "imageUrl and imagePublicId are required" },
        { status: 400 }
      );
    }

    const hero = await Hero.findByIdAndUpdate(
      id,
      { imageUrl: body.imageUrl, imagePublicId: body.imagePublicId },
      { new: true, runValidators: true }
    );

    if (!hero) {
      return NextResponse.json({ error: "Hero not found" }, { status: 404 });
    }

    return NextResponse.json(hero);
  } catch (error) {
    console.error("Failed to update hero:", error);
    return NextResponse.json({ error: "Failed to update hero" }, { status: 500 });
  }
}

// DELETE: Delete hero image
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;

    const hero = await Hero.findByIdAndDelete(id);

    if (!hero) {
      return NextResponse.json({ error: "Hero not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Hero deleted successfully" });
  } catch (error) {
    console.error("Failed to delete hero:", error);
    return NextResponse.json({ error: "Failed to delete hero" }, { status: 500 });
  }
}
