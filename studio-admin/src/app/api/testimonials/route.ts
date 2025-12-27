import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import { testimonialSchema } from "@/lib/validators";

export async function GET() {
  await dbConnect();
  const testimonials = await Testimonial.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(testimonials);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = testimonialSchema.parse(data);
    await dbConnect();
    const testimonial = await Testimonial.create(parsed);
    return NextResponse.json(testimonial, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create testimonial" }, { status: 400 });
  }
}
