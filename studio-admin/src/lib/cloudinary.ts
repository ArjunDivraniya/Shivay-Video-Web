import { v2 as cloudinary } from "cloudinary";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error("Cloudinary environment variables are missing");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export function getCloudinary() {
  return cloudinary;
}

export async function deleteAsset(publicId: string) {
  return cloudinary.uploader.destroy(publicId, { invalidate: true });
}

export async function deleteVideoAsset(publicId: string) {
  return cloudinary.uploader.destroy(publicId, { 
    resource_type: "video",
    invalidate: true 
  });
}

export function extractPublicId(url: string): string | null {
  try {
    // Extract public ID from Cloudinary URL
    // Example: https://res.cloudinary.com/cloudname/image/upload/v123456/folder/image.jpg
    const match = url.match(/\/(?:image|video)\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Failed to extract public ID from URL:", url, error);
    return null;
  }
}
