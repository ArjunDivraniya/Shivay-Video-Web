import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Section from "@/models/Section";
import { sectionSchema } from "@/lib/validators";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const data = await request.json();
    const parsed = sectionSchema.partial().parse({ ...data, key });
    await dbConnect();
    const section = await Section.findOneAndUpdate({ key }, parsed, {
      new: true,
    });
    if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(section);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 400 });
  }
}
