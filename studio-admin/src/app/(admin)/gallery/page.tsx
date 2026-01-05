"use client";

import { useEffect, useRef, useState } from "react";
import { useUpload } from "@/hooks/useUpload";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const { uploading, progress, uploadMultipleFiles } = useUpload();

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
        folder: "shivay-studio/gallery",
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
        const dbRes = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: uploadData.secure_url,
            imagePublicId: uploadData.public_id,
            category,
            serviceType,
          }),
        });

        if (!dbRes.ok) throw new Error("Failed to save to database");
        return await dbRes.json();
      });

      await Promise.all(savePromises);
      setMessage(`✓ ${uploadedFiles.length} image(s) uploaded successfully!`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadGallery();
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragRef.current) {
      dragRef.current.classList.add("border-[var(--accent)]", "bg-[var(--primary)]/5");
    }
  };

  const handleDragLeave = () => {
    if (dragRef.current) {
      dragRef.current.classList.remove("border-[var(--accent)]", "bg-[var(--primary)]/5");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragRef.current) {
      dragRef.current.classList.remove("border-[var(--accent)]", "bg-[var(--primary)]/5");
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUploadImages(files);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setImages(images.filter((img) => img._id !== id));
      setMessage("✓ Photo deleted successfully");
    } catch (error) {
      setMessage("✗ Failed to delete photo");
      console.error(error);
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

      {/* Upload Section */}
      <div className="card p-6 space-y-6 fade-in">
        <h2 className="text-lg font-semibold">Upload Photos</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={uploading}
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
              disabled={uploading}
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
            <p className="text-xs text-gray-500">Link these photos to a specific service</p>
          </div>
        </div>

        <div
          ref={dragRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center cursor-pointer transition-all hover:border-[var(--accent)] hover:bg-[var(--primary)]/5"
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
            <p className="text-lg font-medium text-[var(--foreground)]">
              Drag & drop photos here
            </p>
            <p className="text-sm text-[var(--muted)]">
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

      {/* Category Stats */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Gallery Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {imagesByCategory.map(({ category, count }) => (
            <div
              key={category}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedCategory === category
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] hover:border-[var(--accent)]"
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            >
              <p className="text-xs text-[var(--muted)]">{category}</p>
              <p className="text-2xl font-semibold text-[var(--primary)]">{count}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-[var(--muted)]">
          Total: <span className="font-semibold text-[var(--foreground)]">{images.length}</span> photos
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="ml-3 text-xs text-[var(--primary)] underline"
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
          <span className="text-sm text-[var(--muted)]">{filteredImages.length} photos</span>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading gallery...</p>
        ) : filteredImages.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            {selectedCategory
              ? `No photos in ${selectedCategory} category yet.`
              : "No photos yet. Start uploading!"}
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {filteredImages.map((image) => (
              <div
                key={image._id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-[var(--border)] hover:shadow-lg transition-shadow"
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
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-lg px-3 py-1 text-xs hover:bg-red-600 transition-colors"
                  >
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
