import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Media from "@/models/Media";
import { mediaSchema } from "@/lib/validators";

export async function GET() {
  await dbConnect();
  const media = await Media.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(media);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = mediaSchema.parse(data);
    await dbConnect();
    const media = await Media.create(parsed);
    return NextResponse.json(media, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save media" }, { status: 400 });
  }
}
