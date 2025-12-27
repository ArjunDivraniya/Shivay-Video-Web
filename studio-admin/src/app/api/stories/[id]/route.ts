import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Story from "@/models/Story";
import { storySchema } from "@/lib/validators";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const parsed = storySchema.partial().parse(data);

    await dbConnect();
    const story = await Story.findByIdAndUpdate(id, parsed, { new: true });
    if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(story);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const story = await Story.findByIdAndDelete(id);
    if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
