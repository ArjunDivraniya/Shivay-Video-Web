"use client";

import { useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";

interface WeddingGalleryImage {
  _id: string;
  imageUrl: string;
  imagePublicId: string;
  photoType: "wedding" | "prewedding";
  order: number;
  createdAt: string;
}

export default function WeddingGalleryManager() {
  const [images, setImages] = useState<WeddingGalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const notify = (title: string, description?: string) => {
    console.log(`[Wedding Gallery] ${title}${description ? `: ${description}` : ""}`);
  };

  // Fetch images
  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wedding-gallery");
      const result = await response.json();
      if (result.success) {
        setImages(result.data);
      }
    } catch (error) {
      notify("Error", "Failed to fetch wedding gallery images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle upload success
  const handleUploadSuccess = async (result: any, photoType: "wedding" | "prewedding") => {
    try {
      setUploading(true);
      const response = await fetch("/api/wedding-gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: result.info.secure_url,
          imagePublicId: result.info.public_id,
          photoType,
          order: images.length,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setImages([...images, data.data]);
        notify("Success", "Wedding gallery image uploaded successfully");
      }
    } catch (error) {
      notify("Error", "Failed to save image");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (image: WeddingGalleryImage) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await fetch("/api/wedding-gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: image._id,
          imagePublicId: image.imagePublicId,
        }),
      });

      if (response.ok) {
        setImages(images.filter((img) => img._id !== image._id));
        notify("Success", "Image deleted successfully");
      }
    } catch (error) {
      notify("Error", "Failed to delete image");
    }
  };

  // Handle reorder
  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    // Update order in database
    for (let i = 0; i < newImages.length; i++) {
      try {
        await fetch("/api/wedding-gallery", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: newImages[i]._id,
            order: i,
          }),
        });
      } catch (error) {
        console.error("Failed to update order:", error);
      }
    }

    setImages(newImages);
    notify("Success", "Images reordered successfully");
  };

  const weddingCount = images.filter((img) => img.photoType === "wedding").length;
  const preweddingCount = images.filter((img) => img.photoType === "prewedding").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Wedding Gallery</h2>
        <p className="text-gray-600 mt-1">
          Manage wedding and prewedding photos for the gallery section
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Wedding Photos</p>
          <p className="text-2xl font-bold text-blue-600">{weddingCount}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Prewedding Photos</p>
          <p className="text-2xl font-bold text-purple-600">{preweddingCount}</p>
        </div>
      </div>

      {/* Upload Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={(result: any) => handleUploadSuccess(result, "wedding")}
          onError={(error: any) => {
            notify("Upload Error", error.message || "Failed to upload image");
          }}
        >
          {({ open }) => (
            <button
              onClick={() => open()}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              {uploading ? "Uploading..." : "+ Add Wedding Photo"}
            </button>
          )}
        </CldUploadWidget>

        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={(result: any) => handleUploadSuccess(result, "prewedding")}
          onError={(error: any) => {
            notify("Upload Error", error.message || "Failed to upload image");
          }}
        >
          {({ open }) => (
            <button
              onClick={() => open()}
              disabled={uploading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              {uploading ? "Uploading..." : "+ Add Prewedding Photo"}
            </button>
          )}
        </CldUploadWidget>
      </div>

      {/* Images Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading images...</div>
        ) : images.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No wedding gallery images yet. Start by uploading some photos!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {images.map((image, index) => (
              <div key={image._id} className="relative group">
                <img
                  src={image.imageUrl}
                  alt={`Wedding gallery ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center gap-2 transition">
                  <span className={`text-xs font-bold text-white px-2 py-1 rounded ${
                    image.photoType === "wedding" ? "bg-blue-600" : "bg-purple-600"
                  }`}>
                    {image.photoType === "wedding" ? "WEDDING" : "PREWEDDING"}
                  </span>
                  {index > 0 && (
                    <button
                      onClick={() => handleReorder(index, index - 1)}
                      className="bg-green-600 hover:bg-green-700 text-white p-1 rounded text-xs"
                      title="Move up"
                    >
                      ↑
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      onClick={() => handleReorder(index, index + 1)}
                      className="bg-green-600 hover:bg-green-700 text-white p-1 rounded text-xs"
                      title="Move down"
                    >
                      ↓
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(image)}
                    className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Upload at least 14 images for optimal display. The grid will automatically adjust based on the number of images.
        </p>
      </div>
    </div>
  );
}
