import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import { deleteAsset } from "@/lib/cloudinary";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    await dbConnect();
    const testimonial = await Testimonial.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!testimonial)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(testimonial);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (testimonial.image?.publicId) {
      try {
        await deleteAsset(testimonial.image.publicId);
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
