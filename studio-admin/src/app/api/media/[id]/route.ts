import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Media from "@/models/Media";
import { deleteAsset } from "@/lib/cloudinary";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    await dbConnect();
    const media = await Media.findByIdAndUpdate(id, data, { new: true });
    if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(media);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const media = await Media.findByIdAndDelete(id);
    if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (media.publicId) await deleteAsset(media.publicId);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
