import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Hero from "@/models/Hero";
import { deleteAsset } from "@/lib/cloudinary";

// PUT: Replace hero image
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id } = await params;

    if (!body.imageUrl || !body.imagePublicId) {
      return NextResponse.json(
        { error: "imageUrl and imagePublicId are required" },
        { status: 400 }
      );
    }

    const hero = await Hero.findByIdAndUpdate(
      id,
      { 
        imageUrl: body.imageUrl, 
        imagePublicId: body.imagePublicId,
        title: body.title,
        subtitle: body.subtitle,
        location: body.location,
        styles: body.styles,
      },
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

// PATCH: Update only styles
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id } = await params;

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.styles) updateData.styles = body.styles;

    const hero = await Hero.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!hero) {
      return NextResponse.json({ error: "Hero not found" }, { status: 404 });
    }

    return NextResponse.json(hero);
  } catch (error) {
    console.error("Failed to update hero styles:", error);
    return NextResponse.json({ error: "Failed to update hero styles" }, { status: 500 });
  }
}

// DELETE: Delete hero image
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const hero = await Hero.findById(id);

    if (!hero) {
      return NextResponse.json({ error: "Hero not found" }, { status: 404 });
    }

    // Delete from Cloudinary
    if (hero.imagePublicId) {
      try {
        await deleteAsset(hero.imagePublicId);
      } catch (err) {
        console.error("Failed to delete hero image from Cloudinary:", err);
      }
    }

    await Hero.findByIdAndDelete(id);

    return NextResponse.json({ message: "Hero deleted successfully" });
  } catch (error) {
    console.error("Failed to delete hero:", error);
    return NextResponse.json({ error: "Failed to delete hero" }, { status: 500 });
  }
}
