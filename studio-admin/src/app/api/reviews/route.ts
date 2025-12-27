import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";

export const dynamic = "force-dynamic";

// GET: Fetch all reviews
export async function GET() {
  try {
    await dbConnect();
    const reviews = await Review.find().sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST: Add new review
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.coupleName || !body.review || !body.place || !body.serviceType) {
      return NextResponse.json(
        { error: "coupleName, review, place, and serviceType are required" },
        { status: 400 }
      );
    }

    const review = await Review.create({
      coupleName: body.coupleName,
      review: body.review,
      place: body.place,
      serviceType: body.serviceType,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
