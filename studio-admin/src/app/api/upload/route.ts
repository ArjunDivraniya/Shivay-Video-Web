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

    // Server-side size limits (configurable via env, with safe defaults)
    const MAX_IMAGE_SIZE_MB = Number(process.env.MAX_IMAGE_SIZE_MB || 10); // ~10MB
    const MAX_VIDEO_SIZE_MB = Number(process.env.MAX_VIDEO_SIZE_MB || 100); // ~100MB
    const sizeInMB = Math.round((file.size / (1024 * 1024)) * 100) / 100;

    // Basic type detection
    let resourceType: "image" | "video" = "image";
    if (file.type.startsWith("video/")) {
      resourceType = "video";
    }

    // Reject too-large files early with clear message
    if (resourceType === "image" && sizeInMB > MAX_IMAGE_SIZE_MB) {
      return NextResponse.json(
        {
          error: `Image too large: ${sizeInMB}MB. Max allowed is ${MAX_IMAGE_SIZE_MB}MB. Please compress or use a smaller file.`,
        },
        { status: 413 }
      );
    }

    if (resourceType === "video" && sizeInMB > MAX_VIDEO_SIZE_MB) {
      return NextResponse.json(
        {
          error: `Video too large: ${sizeInMB}MB. Max allowed is ${MAX_VIDEO_SIZE_MB}MB. Consider trimming or lowering bitrate.`,
        },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

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
    // Map Cloudinary error codes to clearer client messages
    const message = error?.message || "Upload failed";
    const httpCode = error?.http_code;

    // 413 Payload Too Large
    if (httpCode === 413 || /too (large|big)/i.test(message)) {
      return NextResponse.json(
        { error: message.includes("MB") ? message : "File too large. Please reduce size and try again." },
        { status: 413 }
      );
    }

    // 400 Bad Request fallback
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
