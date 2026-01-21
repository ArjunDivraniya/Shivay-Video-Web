"use client";

import { useEffect, useRef, useState } from "react";
import { useUpload } from "@/hooks/useUpload";
import ImageUploader from "@/components/ImageUploader";
import { Trash2, Plus } from "lucide-react";

interface GalleryImage {
  _id: string;
  imageUrl: string;
  imagePublicId: string;
  category: string;
  serviceType: string;
  createdAt: string;
}

const CATEGORIES = ["Wedding", "Pre-Wedding", "Engagement", "Corporate", "Party", "Portrait", "Other"];
const SERVICE_TYPES = ["Wedding", "Corporate", "Party", "Other"];

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [services, setServices] = useState<{ serviceType: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Wedding");
  const [serviceType, setServiceType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    loadGallery();
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load services:", error);
    }
  };

  const loadGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load gallery:", error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (data: {
    url: string;
    publicId: string;
    width: number;
    height: number;
  }) => {
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: data.url,
          imagePublicId: data.publicId,
          category,
          serviceType,
        }),
      });

      if (!res.ok) throw new Error("Failed to save gallery image");

      setMessage("✓ Photo uploaded successfully!");
      setTimeout(() => setMessage(""), 3000);
      setShowUploader(false);
      await loadGallery();
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setImages(images.filter((img) => img._id !== id));
      setMessage("✓ Photo deleted successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("✗ Failed to delete photo");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const filteredImages = selectedCategory
    ? images.filter((img) => img.category === selectedCategory)
    : images;

  const imagesByCategory = CATEGORIES.map((cat) => ({
    category: cat,
    count: images.filter((img) => img.category === cat).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Gallery</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Photo Gallery</h1>
        <p className="text-sm text-[var(--muted)]">
          Manage your photography portfolio with categorized images.
        </p>
      </div>

      {/* Upload Button */}
      <button
        onClick={() => setShowUploader(!showUploader)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add New Photo
      </button>

      {/* Upload Section */}
      {showUploader && (
        <div className="card p-6 space-y-6 fade-in border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upload New Photo</h2>
            <button
              onClick={() => setShowUploader(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type (Optional)</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="input"
              >
                <option value="">No service type</option>
                {Array.from(new Set([
                  ...SERVICE_TYPES,
                  ...services.map(s => s.serviceType)
                ])).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Link this photo to a specific service</p>
            </div>
          </div>

          <ImageUploader
            sectionType="square"
            onUploadComplete={handleUploadComplete}
            onError={(error) => {
              setMessage(`✗ Error: ${error}`);
              setTimeout(() => setMessage(""), 3000);
            }}
            label="Select Gallery Photo"
          />

          {message && (
            <div
              className={`text-sm p-3 rounded-lg transition-all ${
                message.startsWith("✓")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      )}

      {/* Category Stats */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Gallery Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {imagesByCategory.map(({ category, count }) => (
            <div
              key={category}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedCategory === category
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            >
              <p className="text-xs text-gray-600">{category}</p>
              <p className="text-2xl font-bold text-blue-600">{count}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">{images.length}</span> photos
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="ml-3 text-xs text-blue-600 underline hover:text-blue-700"
            >
              Clear filter
            </button>
          )}
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {selectedCategory ? `${selectedCategory} Photos` : "All Photos"}
          </h2>
          <span className="text-sm text-gray-600">{filteredImages.length} photos</span>
        </div>

        {loading ? (
          <p className="text-sm text-gray-600">Loading gallery...</p>
        ) : filteredImages.length === 0 ? (
          <p className="text-sm text-gray-600">
            {selectedCategory
              ? `No photos in ${selectedCategory} category yet.`
              : "No photos yet. Start uploading!"}
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {filteredImages.map((image) => (
              <div
                key={image._id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 hover:shadow-lg transition-all"
              >
                <img
                  src={image.imageUrl}
                  alt={image.category}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
                    <p className="text-white text-xs font-medium">{image.category}</p>
                    <p className="text-white/70 text-[10px]">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(image._id)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
