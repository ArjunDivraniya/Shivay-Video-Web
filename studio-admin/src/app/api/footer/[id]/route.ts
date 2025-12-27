import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Footer from "@/models/Footer";

// PUT: Update footer data
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id } = await params;

    const updateData: any = {};
    if (body.phone) updateData.phone = body.phone;
    if (body.email) updateData.email = body.email;
    if (body.instagram !== undefined) updateData.instagram = body.instagram;
    if (body.youtube !== undefined) updateData.youtube = body.youtube;
    if (body.facebook !== undefined) updateData.facebook = body.facebook;

    const footer = await Footer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!footer) {
      return NextResponse.json({ error: "Footer data not found" }, { status: 404 });
    }

    return NextResponse.json(footer);
  } catch (error) {
    console.error("Failed to update footer data:", error);
    return NextResponse.json({ error: "Failed to update footer data" }, { status: 500 });
  }
}
