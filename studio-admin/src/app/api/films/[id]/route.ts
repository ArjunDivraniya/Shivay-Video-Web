import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Film from "@/models/Film";

// PUT: Update film title
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
    if (body.category) updateData.category = body.category;

    const film = await Film.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!film) {
      return NextResponse.json({ error: "Film not found" }, { status: 404 });
    }

    return NextResponse.json(film);
  } catch (error) {
    console.error("Failed to update film:", error);
    return NextResponse.json({ error: "Failed to update film" }, { status: 500 });
  }
}

// DELETE: Delete film
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const film = await Film.findByIdAndDelete(id);

    if (!film) {
      return NextResponse.json({ error: "Film not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Film deleted successfully" });
  } catch (error) {
    console.error("Failed to delete film:", error);
    return NextResponse.json({ error: "Failed to delete film" }, { status: 500 });
  }
}
