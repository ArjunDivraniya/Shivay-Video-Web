import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Section from "@/models/Section";
import { sectionSchema } from "@/lib/validators";
import { handleOptions, createCorsResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

// OPTIONS: Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function GET(request: NextRequest) {
  await dbConnect();
  const sections = await Section.find().sort({ order: 1 }).lean();
  return createCorsResponse(sections, 200, request);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const parsed = sectionSchema.parse(data);
    await dbConnect();
    const section = await Section.findOneAndUpdate(
      { key: parsed.key },
      parsed,
      { upsert: true, new: true }
    );
    return createCorsResponse(section, 201, request);
  } catch (error: any) {
    return createCorsResponse({ error: error.message || "Failed to save section" }, 400, request);
  }
}
