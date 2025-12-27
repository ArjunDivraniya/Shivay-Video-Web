import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";

// PUT: Update service
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id } = await params;

    const updateData: any = {};
    if (body.serviceName) updateData.serviceName = body.serviceName;
    if (body.serviceType) updateData.serviceType = body.serviceType;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.imageUrl) updateData.imageUrl = body.imageUrl;
    if (body.imagePublicId) updateData.imagePublicId = body.imagePublicId;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const service = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Failed to update service:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

// DELETE: Delete service
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Failed to delete service:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
