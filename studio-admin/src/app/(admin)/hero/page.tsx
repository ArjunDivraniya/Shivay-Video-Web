"use client";

import { useEffect, useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import HeroEditor from "@/components/HeroEditor";
import { Trash2 } from "lucide-react";

interface HeroStyles {
  textColor: string;
  overlayOpacity: number;
  justifyContent: "flex-start" | "flex-center" | "flex-end";
  alignItems: "flex-start" | "flex-center" | "flex-end";
  verticalSpacing: number;
}

interface Hero {
  _id: string;
  imageUrl: string;
  imagePublicId: string;
  title?: string;
  subtitle?: string;
  location?: string;
  styles?: HeroStyles;
  updatedAt: string;
}

export default function HeroPage() {
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
          title: hero?.title || "Shivay Video",
          subtitle: hero?.subtitle || "Where emotions become timeless frames",
          location: hero?.location || "Junagadh • Gujarat",
          styles: hero?.styles || {
            textColor: "#ffffff",
            overlayOpacity: 0.5,
            justifyContent: "flex-center",
            alignItems: "flex-center",
            verticalSpacing: 0,
          },
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

  const handleStylesChange = async (styles: HeroStyles) => {
    if (!hero) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/hero/${hero._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          styles,
        }),
      });

      if (!res.ok) throw new Error("Failed to save styles");

      const updatedHero = await res.json();
      setHero(updatedHero);
      setMessage("✓ Styles saved automatically");
      setTimeout(() => setMessage(""), 2000);
    } catch (error: any) {
      console.error("Failed to save styles:", error);
      setMessage(`✗ Error: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTextChange = async (field: "title" | "subtitle" | "location", value: string) => {
    if (!hero) return;

    const updated = { ...hero, [field]: value };
    setHero(updated);

    try {
      const res = await fetch(`/api/hero/${hero._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [field]: value,
        }),
      });

      if (!res.ok) throw new Error("Failed to save text");
    } catch (error: any) {
      console.error("Failed to save text:", error);
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
          Main landing page hero image – large, high-quality, brand-defining visual with customizable text styling.
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

      {/* Hero Editor */}
      {hero && (
        <div className="card p-6 space-y-4 fade-in">
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={hero.title || ""}
                onChange={(e) => handleTextChange("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Shivay Video"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                value={hero.subtitle || ""}
                onChange={(e) => handleTextChange("subtitle", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Where emotions become timeless frames"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={hero.location || ""}
                onChange={(e) => handleTextChange("location", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Junagadh • Gujarat"
              />
            </div>
          </div>

          <HeroEditor
            imageUrl={hero.imageUrl}
            title={hero.title || "Shivay Video"}
            subtitle={hero.subtitle || "Where emotions become timeless frames"}
            location={hero.location || "Junagadh • Gujarat"}
            onStylesChange={handleStylesChange}
            initialStyles={hero.styles || {
              textColor: "#ffffff",
              overlayOpacity: 0.5,
              justifyContent: "flex-center",
              alignItems: "flex-center",
              verticalSpacing: 0,
            }}
          />
          
          {isSaving && (
            <div className="text-xs text-blue-600 flex items-center gap-2">
              <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full" />
              Saving...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
