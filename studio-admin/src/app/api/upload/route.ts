import { NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "shivay-studio";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine resource type based on file type
    let resourceType: "image" | "video" = "image";
    if (file.type.startsWith("video/")) {
      resourceType = "video";
    }

    const cloudinary = getCloudinary();

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType,
          eager:
            resourceType === "video"
              ? [{ width: 300, height: 300, crop: "fill", format: "jpg" }]
              : undefined,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(buffer);
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 400 }
    );
  }
}
