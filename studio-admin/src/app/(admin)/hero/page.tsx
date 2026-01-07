"use client";

import { useEffect, useRef, useState } from "react";
import { useUpload } from "@/hooks/useUpload";

interface Hero {
  _id: string;
  imageUrl: string;
  imagePublicId: string;
  updatedAt: string;
}

export default function HeroPage() {
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const { uploading, progress, uploadFile } = useUpload();

  useEffect(() => {
    loadHero();
  }, []);

  const loadHero = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hero");
      const data = await res.json();
      if (data._id) {
        setHero(data);
      }
    } catch (error) {
      console.error("Failed to load hero:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage("✗ Please select an image file");
      return;
    }

    try {
      setMessage("Uploading hero image...");

      const uploadData: any = await uploadFile(file, {
        folder: "shivay-studio/hero",
        onProgress: (p) => {
          setMessage(`Uploading hero image... ${p.percentage}%`);
        },
        onError: (error) => {
          setMessage(`✗ Error: ${error}`);
        },
      });

      // Save to database
      const dbRes = await fetch("/api/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadData.secure_url,
          imagePublicId: uploadData.public_id,
        }),
      });

      if (!dbRes.ok) {
        throw new Error("Failed to save hero image");
      }

      setMessage("✓ Hero image uploaded successfully!");
      await loadHero();
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
      console.error("Upload error:", error);
    }
  };

  const handleFileSelect = (file: File) => {
    handleUpload(file);
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
      handleFileSelect(files[0]);
    }
  };

  const handleDelete = async () => {
    if (!hero || !confirm("Delete hero image? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/hero/${hero._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setHero(null);
      setMessage("✓ Hero image deleted successfully");
    } catch (error) {
      setMessage("✗ Failed to delete hero image");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Hero Section</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Hero Image</h1>
        <p className="text-sm text-[var(--muted)]">
          Main landing page hero image – large, high-quality, brand-defining visual.
        </p>
      </div>

      {/* Current Hero */}
      {hero && (
        <div className="card p-6 space-y-4 fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Current Hero Image</h2>
            <button
              onClick={handleDelete}
              className="text-xs text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
          <div className="relative aspect-[21/9] overflow-hidden rounded-lg bg-[var(--border)]">
            <img
              src={hero.imageUrl}
              alt="Hero"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-xs text-[var(--muted)]">
            Last updated: {new Date(hero.updatedAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* Upload Section */}
      <div className="card p-6 space-y-4 fade-in">
        <h2 className="text-lg font-semibold">
          {hero ? "Replace Hero Image" : "Upload Hero Image"}
        </h2>

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
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            className="hidden"
            disabled={uploading}
          />
          <div className="space-y-3">
            <div className="text-5xl">🖼️</div>
            <p className="text-lg font-medium text-[var(--foreground)]">
              Drag & drop hero image here
            </p>
            <p className="text-sm text-[var(--muted)]">
              or click to browse • Recommended: 2560×1080px or larger
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
              <p className="text-sm text-blue-700">Uploading hero image...</p>
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

      {loading && (
        <div className="card p-6 text-center">
          <p className="text-sm text-[var(--muted)]">Loading hero image...</p>
        </div>
      )}
    </div>
  );
}
