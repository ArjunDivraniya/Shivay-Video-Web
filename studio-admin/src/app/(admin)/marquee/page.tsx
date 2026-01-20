"use client";

import { useEffect, useRef, useState } from "react";
import { useUpload } from "@/hooks/useUpload";

interface GalleryImage {
  _id: string;
  imageUrl: string;
  imagePublicId: string;
  category: string;
  serviceType: string;
  isHighlight: boolean;
  createdAt: string;
}

const CATEGORIES = ["Wedding", "Pre-Wedding", "Engagement", "Corporate", "Party", "Portrait", "Other"];

export default function MarqueeGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Wedding");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const { uploading, progress, uploadMultipleFiles } = useUpload();

  useEffect(() => {
    loadHighlightGallery();
  }, []);

  const loadHighlightGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery/highlight");
      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load highlight gallery:", error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = async (files: FileList) => {
    if (files.length === 0) return;

    setMessage(`Uploading ${files.length} image(s) for marquee...`);

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
        folder: "shivay-studio/gallery/marquee",
        onProgress: (p) => {
          setMessage(
            `Uploading ${p.loaded} of ${p.total} files... ${p.percentage}%`
          );
        },
        onError: (error) => {
          setMessage(`✗ Error: ${error}`);
        },
      });

      // Save all uploaded files to database with isHighlight
      const savePromises = uploadedFiles.map(async (uploadData: any) => {
        const dbRes = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: uploadData.secure_url,
            imagePublicId: uploadData.public_id,
            category,
            serviceType: "",
            isHighlight: true,
          }),
        });

        if (!dbRes.ok) throw new Error("Failed to save to database");
        return await dbRes.json();
      });

      await Promise.all(savePromises);
      setMessage(`✓ ${uploadedFiles.length} marquee image(s) uploaded successfully!`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadHighlightGallery();
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
    if (!confirm("Delete this marquee photo? This action cannot be undone.")) return;

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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Marquee</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Marquee Gallery (Bottom Animation)</h1>
        <p className="text-sm text-[var(--muted)]">
          Upload and manage images used in the animated marquee at the bottom of Wedding Stories.
        </p>
      </div>

      {/* Upload Section */}
      <div className="card p-6 space-y-6 fade-in">
        <h2 className="text-lg font-semibold">Upload Marquee Photos</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category (Optional)</label>
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
            <p className="text-xs text-gray-500">Category is stored but not shown on hover</p>
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
            <div className="text-5xl">🌀</div>
            <p className="text-lg font-medium text-[var(--foreground)]">
              Drag & drop marquee photos here
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

      {/* Gallery Grid */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Marquee Photos</h2>
          <span className="text-sm text-[var(--muted)]">{images.length} photos</span>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading marquee gallery...</p>
        ) : images.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No marquee photos yet. Start uploading!</p>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <div
                key={image._id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-[var(--border)] hover:shadow-lg transition-shadow"
              >
                <img
                  src={image.imageUrl}
                  alt={image.category}
                  className="w-full h-full object-cover"
                />
                {/* No category overlay on hover for marquee */}
                <button
                  onClick={() => handleDelete(image._id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-lg px-3 py-1 text-xs hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
