/**
 * Canvas Utilities for Image Processing
 * Provides pixel-perfect cropping and image manipulation
 */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Convert percentage-based crop coordinates to pixel coordinates
 */
export function getPixelCrop(
  percentCrop: any,
  imageWidth: number,
  imageHeight: number
): CropArea {
  return {
    x: (percentCrop.x * imageWidth) / 100,
    y: (percentCrop.y * imageHeight) / 100,
    width: (percentCrop.width * imageWidth) / 100,
    height: (percentCrop.height * imageHeight) / 100,
  };
}

/**
 * Create a cropped image blob from canvas
 */
export async function createCroppedImage(
  imageSrc: string,
  croppedAreaPixels: CropArea,
  rotation = 0
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Set canvas dimensions to match cropped area
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Apply rotation if needed
      if (rotation) {
        const radians = (rotation * Math.PI) / 180;
        ctx.translate(croppedAreaPixels.width / 2, croppedAreaPixels.height / 2);
        ctx.rotate(radians);
        ctx.translate(-croppedAreaPixels.width / 2, -croppedAreaPixels.height / 2);
      }

      // Draw cropped portion
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/png",
        1.0
      );
    };

    image.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File, maxSizeMB = 50): string | null {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (!allowedTypes.includes(file.type)) {
    return "Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF)";
  }

  if (file.size > maxSizeBytes) {
    return `File size exceeds ${maxSizeMB}MB limit`;
  }

  return null;
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Resize image maintaining aspect ratio
 */
export async function resizeImage(
  blob: Blob,
  maxWidth: number,
  maxHeight: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (resizedBlob) => {
            if (resizedBlob) {
              resolve(resizedBlob);
            } else {
              reject(new Error("Failed to resize image"));
            }
          },
          "image/webp",
          0.9
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(blob);
  });
}
