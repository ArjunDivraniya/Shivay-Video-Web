import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Story from "@/models/Story";

export async function GET() {
  await dbConnect();
  const stories = await Story.find({ isFeatured: true }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(stories);
}
