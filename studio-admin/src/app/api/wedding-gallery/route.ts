import { NextRequest, NextResponse } from "next/server";
import WeddingGalleryImage from "@/models/WeddingGalleryImage";
import connectDB from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET all wedding gallery images
export async function GET() {
  try {
    await connectDB();
    const images = await WeddingGalleryImage.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: images });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST new wedding gallery image
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { imageUrl, imagePublicId, photoType, order } = body;

    if (!imageUrl || !imagePublicId || !photoType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newImage = await WeddingGalleryImage.create({
      imageUrl,
      imagePublicId,
      photoType,
      order: order || 0,
    });

    return NextResponse.json(
      { success: true, data: newImage },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update image order or details
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, order, photoType } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing image ID" },
        { status: 400 }
      );
    }

    const updatedImage = await WeddingGalleryImage.findByIdAndUpdate(
      id,
      { order, photoType },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedImage });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE wedding gallery image
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, imagePublicId } = body;

    if (!id || !imagePublicId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(imagePublicId);

    // Delete from database
    await WeddingGalleryImage.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Image deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
