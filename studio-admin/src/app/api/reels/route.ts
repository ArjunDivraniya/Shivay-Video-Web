import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reel from "@/models/Reel";
import { reelSchema } from "@/lib/validators";

export async function GET() {
  await dbConnect();
  const reels = await Reel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(reels);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = reelSchema.parse(data);
    await dbConnect();
    const reel = await Reel.create(parsed);
    return NextResponse.json(reel, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create reel" }, { status: 400 });
  }
}
