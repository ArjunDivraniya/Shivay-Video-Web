import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";

export const dynamic = "force-dynamic";

// GET: Get all services
export async function GET() {
  try {
    await dbConnect();
    const services = await Service.find().sort({ createdAt: -1 });
    return NextResponse.json(services);
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

// POST: Add new service
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.serviceName || !body.serviceType || !body.imageUrl || !body.imagePublicId) {
      return NextResponse.json(
        { error: "serviceName, serviceType, imageUrl, and imagePublicId are required" },
        { status: 400 }
      );
    }

    const service = await Service.create({
      serviceName: body.serviceName,
      serviceType: body.serviceType,
      imageUrl: body.imageUrl,
      imagePublicId: body.imagePublicId,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Failed to create service:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
