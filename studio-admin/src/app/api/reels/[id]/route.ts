import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reel from "@/models/Reel";
import { deleteAsset } from "@/lib/cloudinary";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    await dbConnect();
    const reel = await Reel.findByIdAndUpdate(id, data, { new: true });
    if (!reel) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(reel);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const reel = await Reel.findByIdAndDelete(id);
    if (!reel) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (reel.publicId) await deleteAsset(reel.publicId);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
