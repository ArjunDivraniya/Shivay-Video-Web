import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Story from "@/models/Story";
import { storySchema } from "@/lib/validators";
import { handleOptions, createCorsResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

// OPTIONS: Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function GET(request: NextRequest) {
  await dbConnect();
  const stories = await Story.find().sort({ createdAt: -1 }).lean();
  return createCorsResponse(stories, 200, request);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const parsed = storySchema.parse(data);

    await dbConnect();
    const story = await Story.create(parsed);
    return createCorsResponse(story, 201, request);
  } catch (error: any) {
    return createCorsResponse({ error: error.message || "Failed to create story" }, 400, request);
  }
}
