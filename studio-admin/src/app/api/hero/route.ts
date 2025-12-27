import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Hero from "@/models/Hero";

export const dynamic = "force-dynamic";

// GET: Retrieve hero image
export async function GET() {
  try {
    await dbConnect();
    const hero = await Hero.findOne().sort({ updatedAt: -1 });
    return NextResponse.json(hero || {});
  } catch (error) {
    console.error("Failed to fetch hero:", error);
    return NextResponse.json({ error: "Failed to fetch hero" }, { status: 500 });
  }
}

// POST: Upload new hero image
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.imageUrl || !body.imagePublicId) {
      return NextResponse.json(
        { error: "imageUrl and imagePublicId are required" },
        { status: 400 }
      );
    }

    // Delete existing hero images (only keep one)
    await Hero.deleteMany({});

    const hero = await Hero.create({
      imageUrl: body.imageUrl,
      imagePublicId: body.imagePublicId,
    });

    return NextResponse.json(hero, { status: 201 });
  } catch (error) {
    console.error("Failed to create hero:", error);
    return NextResponse.json({ error: "Failed to create hero" }, { status: 500 });
  }
}
