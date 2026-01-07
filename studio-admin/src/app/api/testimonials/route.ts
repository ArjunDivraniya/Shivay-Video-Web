import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import { testimonialSchema } from "@/lib/validators";
import { handleOptions, createCorsResponse } from "@/lib/cors";

// OPTIONS: Handle preflight requests
export async function OPTIONS(request: Request) {
  return handleOptions(request);
}

export async function GET(request: Request) {
  await dbConnect();
  const testimonials = await Testimonial.find().sort({ createdAt: -1 }).lean();
  return createCorsResponse(testimonials, 200, request);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = testimonialSchema.parse(data);
    await dbConnect();
    const testimonial = await Testimonial.create(parsed);
    return createCorsResponse(testimonial, 201, request);
  } catch (error: any) {
    return createCorsResponse({ error: error.message || "Failed to create testimonial" }, 400, request);
  }
}
