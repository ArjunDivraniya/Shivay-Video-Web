import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reel from "@/models/Reel";
import { reelSchema } from "@/lib/validators";
import { handleOptions, createCorsResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

// OPTIONS: Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function GET(request: NextRequest) {
  await dbConnect();
  const reels = await Reel.find().sort({ createdAt: -1 }).lean();
  return createCorsResponse(reels, 200, request);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const parsed = reelSchema.parse(data);
    await dbConnect();
    const reel = await Reel.create(parsed);
    return createCorsResponse(reel, 201, request);
  } catch (error: any) {
    return createCorsResponse({ error: error.message || "Failed to create reel" }, 400, request);
  }
}
