import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Story from "@/models/Story";
import { storySchema } from "@/lib/validators";

export async function GET() {
  await dbConnect();
  const stories = await Story.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(stories);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = storySchema.parse(data);

    await dbConnect();
    const story = await Story.create(parsed);
    return NextResponse.json(story, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create story" }, { status: 400 });
  }
}
