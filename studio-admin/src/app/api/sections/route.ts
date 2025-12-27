import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Section from "@/models/Section";
import { sectionSchema } from "@/lib/validators";

export async function GET() {
  await dbConnect();
  const sections = await Section.find().sort({ order: 1 }).lean();
  return NextResponse.json(sections);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = sectionSchema.parse(data);
    await dbConnect();
    const section = await Section.findOneAndUpdate(
      { key: parsed.key },
      parsed,
      { upsert: true, new: true }
    );
    return NextResponse.json(section, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save section" }, { status: 400 });
  }
}
