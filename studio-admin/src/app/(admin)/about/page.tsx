"use client";

import { useEffect, useRef, useState } from "react";

interface About {
  _id: string;
  experienceYears: number;
  weddingsCompleted: number;
  destinations: number;
  happyCouples: number;
  images: string[];
  createdAt: string;
}

export default function AboutPage() {
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [weddingsCompleted, setWeddingsCompleted] = useState(0);
  const [destinations, setDestinations] = useState(0);
  const [happyCouples, setHappyCouples] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAbout();
  }, []);

  const loadAbout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/about");
      if (res.ok) {
        const data = await res.json();
        setAbout(data);
        setExperienceYears(data.experienceYears);
        setWeddingsCompleted(data.weddingsCompleted);
        setDestinations(data.destinations);
        setHappyCouples(data.happyCouples);
        setImages(data.images || []);
      }
    } catch (error) {
      console.error("Failed to load about data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage("✗ Please select an image file");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "shivay-studio/about");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || "Upload failed");
      }

      const uploadData = await uploadRes.json();
      setImages([...images, uploadData.secure_url]);
      setMessage("✓ Image added");
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (experienceYears < 0 || weddingsCompleted < 0 || destinations < 0 || happyCouples < 0) {
      setMessage("✗ Numbers cannot be negative");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (!about) {
        // Create new about data
        const res = await fetch("/api/about", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            experienceYears,
            weddingsCompleted,
            destinations,
            happyCouples,
            images,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to create about data");
        }

        const data = await res.json();
        setAbout(data);
        setMessage("✓ About data created successfully!");
      } else {
        // Update existing about data
        const res = await fetch(`/api/about/${about._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            experienceYears,
            weddingsCompleted,
            destinations,
            happyCouples,
            images,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to update about data");
        }

        const data = await res.json();
        setAbout(data);
        setMessage("✓ About data updated successfully!");
      }
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setLoading(false);
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
      handleUploadImage(files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">About Us</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">About Your Studio</h1>
        <p className="text-sm text-[var(--muted)]">
          Manage your studio statistics and about section photos.
        </p>
      </div>

      {/* Stats Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6 fade-in">
        <h2 className="text-lg font-semibold">Studio Statistics</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Experience (Years)</label>
            <input
              type="number"
              value={experienceYears}
              onChange={(e) => setExperienceYears(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              className="input"
              placeholder="e.g., 10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Weddings Completed</label>
            <input
              type="number"
              value={weddingsCompleted}
              onChange={(e) => setWeddingsCompleted(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              className="input"
              placeholder="e.g., 500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Destinations Covered</label>
            <input
              type="number"
              value={destinations}
              onChange={(e) => setDestinations(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              className="input"
              placeholder="e.g., 50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Happy Couples</label>
            <input
              type="number"
              value={happyCouples}
              onChange={(e) => setHappyCouples(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              className="input"
              placeholder="e.g., 500"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">About Section Photos</label>
          <div
            ref={dragRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center cursor-pointer transition-all hover:border-[var(--accent)] hover:bg-[var(--primary)]/5"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleUploadImage(e.target.files[0])}
              className="hidden"
              disabled={uploading}
              multiple
            />
            <div className="space-y-3">
              <div className="text-4xl">📸</div>
              <p className="text-sm font-medium">Drag & drop images here</p>
              <p className="text-xs text-[var(--muted)]">or click to browse</p>
            </div>
          </div>
          <p className="text-xs text-[var(--muted)]">Add multiple photos to showcase your work</p>
        </div>

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Uploaded Photos ({images.length})</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {images.map((image, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-[var(--border)]">
                  <img
                    src={image}
                    alt={`About ${idx + 1}`}
                    className="w-full h-24 object-cover group-hover:opacity-70 transition-opacity"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 flex items-center justify-center bg-red-600/90 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-white text-sm font-semibold">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[#5a1922] disabled:opacity-60 transition-colors"
        >
          {loading ? "Saving..." : about ? "Update About Data" : "Create About Data"}
        </button>
      </form>

      {/* Current Stats Display */}
      {about && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-6 text-center space-y-2">
            <p className="text-4xl font-bold text-[var(--primary)]">{about.experienceYears}</p>
            <p className="text-sm text-[var(--muted)]">Years of Experience</p>
          </div>
          <div className="card p-6 text-center space-y-2">
            <p className="text-4xl font-bold text-[var(--accent)]">{about.weddingsCompleted}</p>
            <p className="text-sm text-[var(--muted)]">Weddings Completed</p>
          </div>
          <div className="card p-6 text-center space-y-2">
            <p className="text-4xl font-bold text-blue-600">{about.destinations}</p>
            <p className="text-sm text-[var(--muted)]">Destinations</p>
          </div>
          <div className="card p-6 text-center space-y-2">
            <p className="text-4xl font-bold text-purple-600">{about.happyCouples}</p>
            <p className="text-sm text-[var(--muted)]">Happy Couples</p>
          </div>
        </div>
      )}
    </div>
  );
}
