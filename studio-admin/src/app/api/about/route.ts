import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import About from "@/models/About";

export const dynamic = "force-dynamic";

// GET: Fetch about data
export async function GET() {
  try {
    await dbConnect();
    const about = await About.findOne();
    if (!about) {
      return NextResponse.json({ error: "About data not found" }, { status: 404 });
    }
    return NextResponse.json(about);
  } catch (error) {
    console.error("Failed to fetch about data:", error);
    return NextResponse.json({ error: "Failed to fetch about data" }, { status: 500 });
  }
}

// POST: Create about data
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Check if about data already exists
    const existingAbout = await About.findOne();
    if (existingAbout) {
      return NextResponse.json(
        { error: "About data already exists. Use PUT to update." },
        { status: 400 }
      );
    }

    if (
      typeof body.experienceYears !== "number" ||
      typeof body.weddingsCompleted !== "number" ||
      typeof body.destinations !== "number" ||
      typeof body.happyCouples !== "number"
    ) {
      return NextResponse.json(
        { error: "experienceYears, weddingsCompleted, destinations, and happyCouples must be numbers" },
        { status: 400 }
      );
    }

    const about = await About.create({
      experienceYears: body.experienceYears,
      weddingsCompleted: body.weddingsCompleted,
      destinations: body.destinations,
      happyCouples: body.happyCouples,
      images: body.images || [],
    });

    return NextResponse.json(about, { status: 201 });
  } catch (error) {
    console.error("Failed to create about data:", error);
    return NextResponse.json({ error: "Failed to create about data" }, { status: 500 });
  }
}
