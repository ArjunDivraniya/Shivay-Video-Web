"use client";

import { useEffect, useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import { Trash2 } from "lucide-react";

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

  const handleUploadComplete = async (data: {
    url: string;
    publicId: string;
    width: number;
    height: number;
  }) => {
    try {
      const res = await fetch("/api/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: data.url,
          imagePublicId: data.publicId,
        }),
      });

      if (!res.ok) throw new Error("Failed to save hero image");

      setMessage("✓ Hero image uploaded successfully!");
      setTimeout(() => setMessage(""), 3000);
      await loadHero();
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDelete = async () => {
    if (!hero || !confirm("Delete hero image? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/hero/${hero._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setHero(null);
      setMessage("✓ Hero image deleted successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("✗ Failed to delete hero image");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Hero Section</p>
          <h1 className="text-3xl font-[var(--font-heading)] mt-1">Hero Image</h1>
        </div>
        <div className="card p-6 text-center">
          <p className="text-sm text-[var(--muted)]">Loading hero image...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Hero Section</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Hero Image</h1>
        <p className="text-sm text-[var(--muted)]">
          Main landing page hero image – large, high-quality, brand-defining visual.
        </p>
      </div>

      {/* Upload Section */}
      <div className="card p-6 space-y-4 fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {hero ? "Update Hero Image" : "Upload Hero Image"}
          </h2>
          {hero && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-xs text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
        </div>

        <ImageUploader
          sectionType="hero"
          onUploadComplete={handleUploadComplete}
          onError={(error) => {
            setMessage(`✗ Error: ${error}`);
            setTimeout(() => setMessage(""), 3000);
          }}
          label="Select Hero Image"
          existingImageUrl={hero?.imageUrl}
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

      {/* Current Hero Info */}
      {hero && (
        <div className="card p-6 space-y-4 fade-in bg-gradient-to-br from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-900">Current Image</h3>
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-[var(--border)]">
            <img
              src={hero.imageUrl}
              alt="Hero"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-xs text-gray-600">
            Last updated: {new Date(hero.updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
