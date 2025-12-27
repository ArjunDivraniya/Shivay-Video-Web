import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Footer from "@/models/Footer";

export const dynamic = "force-dynamic";

// GET: Fetch footer data
export async function GET() {
  try {
    await dbConnect();
    const footer = await Footer.findOne();
    if (!footer) {
      return NextResponse.json({ error: "Footer data not found" }, { status: 404 });
    }
    return NextResponse.json(footer);
  } catch (error) {
    console.error("Failed to fetch footer data:", error);
    return NextResponse.json({ error: "Failed to fetch footer data" }, { status: 500 });
  }
}

// POST: Create footer data
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Check if footer data already exists
    const existingFooter = await Footer.findOne();
    if (existingFooter) {
      return NextResponse.json(
        { error: "Footer data already exists. Use PUT to update." },
        { status: 400 }
      );
    }

    if (!body.phone || !body.email) {
      return NextResponse.json(
        { error: "phone and email are required" },
        { status: 400 }
      );
    }

    const footer = await Footer.create({
      phone: body.phone,
      email: body.email,
      instagram: body.instagram || "",
      youtube: body.youtube || "",
      facebook: body.facebook || "",
    });

    return NextResponse.json(footer, { status: 201 });
  } catch (error) {
    console.error("Failed to create footer data:", error);
    return NextResponse.json({ error: "Failed to create footer data" }, { status: 500 });
  }
}
