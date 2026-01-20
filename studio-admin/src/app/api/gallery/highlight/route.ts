import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gallery from "@/models/Gallery";

export const dynamic = "force-dynamic";

// GET: Get all highlight (marquee) gallery images
export async function GET() {
  try {
    await dbConnect();
    const images = await Gallery.find({ isHighlight: true }).sort({ createdAt: -1 });
    return NextResponse.json(images);
  } catch (error) {
    console.error("Failed to fetch highlight gallery:", error);
    return NextResponse.json({ error: "Failed to fetch highlight gallery" }, { status: 500 });
  }
}
