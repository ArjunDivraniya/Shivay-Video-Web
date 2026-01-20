"use client";

import { useState, useEffect, useRef } from "react";
import { useUpload } from "@/hooks/useUpload";

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
  const [message, setMessage] = useState("");
  const [photoType, setPhotoType] = useState<"wedding" | "prewedding">("wedding");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const { uploading, progress, uploadMultipleFiles } = useUpload();

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
      setMessage("Failed to fetch wedding gallery images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle upload images
  const handleUploadImages = async (files: FileList) => {
    if (files.length === 0) return;

    setMessage(`Uploading ${files.length} image(s)...`);

    try {
      const fileArray = Array.from(files).filter((file) => {
        if (!file.type.startsWith("image/")) {
          setMessage(`✗ ${file.name} is not an image`);
          return false;
        }
        return true;
      });

      if (fileArray.length === 0) return;

      const uploadedFiles = await uploadMultipleFiles(fileArray, {
        folder: "shivay-studio/wedding-gallery",
        onProgress: (p) => {
          setMessage(
            `Uploading ${p.loaded} of ${p.total} files... ${p.percentage}%`
          );
        },
        onError: (error) => {
          setMessage(`✗ Error: ${error}`);
        },
      });

      // Save all uploaded files to database
      const savePromises = uploadedFiles.map(async (uploadData: any) => {
        const dbRes = await fetch("/api/wedding-gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: uploadData.secure_url,
            imagePublicId: uploadData.public_id,
            photoType,
            order: images.length,
          }),
        });

        if (!dbRes.ok) throw new Error("Failed to save to database");
        return await dbRes.json();
      });

      const savedImages = await Promise.all(savePromises);
      setImages([...images, ...savedImages.map(r => r.data)]);
      setMessage(`✓ ${uploadedFiles.length} image(s) uploaded successfully!`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragRef.current) {
      dragRef.current.classList.add("border-blue-500", "bg-blue-50");
    }
  };

  const handleDragLeave = () => {
    if (dragRef.current) {
      dragRef.current.classList.remove("border-blue-500", "bg-blue-50");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragRef.current) {
      dragRef.current.classList.remove("border-blue-500", "bg-blue-50");
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUploadImages(files);
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
        setMessage("✓ Image deleted successfully");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Failed to delete image");
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
    setMessage("✓ Images reordered successfully");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Wedding Gallery</h2>
        <p className="text-gray-600 mt-1">
          Manage wedding and prewedding photos for the gallery section
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h3 className="text-lg font-semibold">Upload Photos</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Photo Type</label>
          <select
            value={photoType}
            onChange={(e) => setPhotoType(e.target.value as "wedding" | "prewedding")}
            disabled={uploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="wedding">Wedding Photos</option>
            <option value="prewedding">Prewedding Photos</option>
          </select>
        </div>

        <div
          ref={dragRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleUploadImages(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
          <div className="space-y-3">
            <div className="text-5xl">📸</div>
            <p className="text-lg font-medium text-gray-900">
              Drag & drop photos here
            </p>
            <p className="text-sm text-gray-600">
              or click to browse • Multiple images supported
            </p>
          </div>
        </div>

        {message && (
          <p
            className={`text-sm p-3 rounded-lg ${
              message.startsWith("✓")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </p>
        )}

        {uploading && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              <p className="text-sm text-blue-700">
                Uploading {progress.loaded} of {progress.total} files...
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 ease-out flex items-center justify-center text-[10px] text-white font-semibold"
                style={{ width: `${progress.percentage}%` }}
              >
                {progress.percentage > 10 && `${progress.percentage}%`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Wedding Photos</p>
          <p className="text-2xl font-bold text-blue-600">
            {images.filter((img) => img.photoType === "wedding").length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600">Prewedding Photos</p>
          <p className="text-2xl font-bold text-purple-600">
            {images.filter((img) => img.photoType === "prewedding").length}
          </p>
        </div>
      </div>

      {/* Images Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Gallery</h3>
          <p className="text-sm text-gray-600 mt-1">{images.length} photos uploaded</p>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            Loading images...
          </div>
        ) : images.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">No photos yet</p>
            <p className="text-sm mt-1">Upload some photos using the drag & drop area above</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {images.map((image, index) => (
              <div key={image._id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-shadow">
                <img
                  src={image.imageUrl}
                  alt={`Wedding gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2 flex items-end justify-between">
                    <span className={`text-xs font-bold text-white px-2 py-1 rounded ${
                      image.photoType === "wedding" ? "bg-blue-600" : "bg-purple-600"
                    }`}>
                      {image.photoType === "wedding" ? "WEDDING" : "PREWEDDING"}
                    </span>
                    <div className="flex gap-1">
                      {index > 0 && (
                        <button
                          onClick={() => handleReorder(index, index - 1)}
                          className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded text-xs transition"
                          title="Move up"
                        >
                          ↑
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button
                          onClick={() => handleReorder(index, index + 1)}
                          className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded text-xs transition"
                          title="Move down"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(image)}
                        className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded text-xs transition"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Upload at least 14 images for optimal display. Use drag & drop buttons to reorder your gallery.
        </p>
      </div>
    </div>
  );
}
