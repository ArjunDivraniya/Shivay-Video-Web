import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import { handleOptions, createCorsResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

// OPTIONS: Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

// GET: Get all services
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const services = await Service.find().sort({ createdAt: -1 });
    return createCorsResponse(services, 200, request);
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return createCorsResponse({ error: "Failed to fetch services" }, 500, request);
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
      description: body.description || "",
      imageUrl: body.imageUrl,
      imagePublicId: body.imagePublicId,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return createCorsResponse(service, 201, req);
  } catch (error) {
    console.error("Failed to create service:", error);
    return createCorsResponse({ error: "Failed to create service" }, 500, req);
  }
}
