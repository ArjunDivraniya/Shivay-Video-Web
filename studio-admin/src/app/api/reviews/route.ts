import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import { handleOptions, createCorsResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

// OPTIONS: Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

// GET: Fetch all reviews
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const reviews = await Review.find().sort({ createdAt: -1 });
    return createCorsResponse(reviews, 200, request);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return createCorsResponse({ error: "Failed to fetch reviews" }, 500, request);
  }
}

// POST: Add new review
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.coupleName || !body.review || !body.place || !body.serviceType) {
      return createCorsResponse(
        { error: "coupleName, review, place, and serviceType are required" },
        400,
        req
      );
    }

    const review = await Review.create({
      coupleName: body.coupleName,
      review: body.review,
      place: body.place,
      serviceType: body.serviceType,
    });

    return createCorsResponse(review, 201, req);
  } catch (error) {
    console.error("Failed to create review:", error);
    return createCorsResponse({ error: "Failed to create review" }, 500, req);
  }
}
