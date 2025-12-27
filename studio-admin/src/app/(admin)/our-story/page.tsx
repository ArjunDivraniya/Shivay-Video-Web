"use client";

import { useEffect, useRef, useState } from "react";

interface OurStory {
  _id: string;
  imageUrl: string;
  imagePublicId: string;
  startedYear: number;
  description: string;
  updatedAt: string;
}

export default function OurStoryPage() {
  const [ourStory, setOurStory] = useState<OurStory | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [startedYear, setStartedYear] = useState<number>(new Date().getFullYear());
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadOurStory();
  }, []);

  const loadOurStory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/our-story");
      const data = await res.json();
      if (data._id) {
        setOurStory(data);
        setStartedYear(data.startedYear);
        setDescription(data.description);
        setImageUrl(data.imageUrl);
        setImagePublicId(data.imagePublicId);
      }
    } catch (error) {
      console.error("Failed to load our story:", error);
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
      formData.append("folder", "shivay-studio/our-story");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || "Upload failed");
      }

      const uploadData = await uploadRes.json();
      setImageUrl(uploadData.secure_url);
      setImagePublicId(uploadData.public_id);
      setMessage("✓ Image uploaded successfully");
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl || !imagePublicId || !startedYear || !description.trim()) {
      setMessage("✗ Please fill in all fields and upload an image");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const dbRes = await fetch("/api/our-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          imagePublicId,
          startedYear,
          description,
        }),
      });

      if (!dbRes.ok) {
        throw new Error("Failed to save our story");
      }

      setMessage("✓ Our Story saved successfully!");
      await loadOurStory();
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

  const handleDelete = async () => {
    if (!ourStory || !confirm("Delete our story? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/our-story/${ourStory._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setOurStory(null);
      setImageUrl("");
      setImagePublicId("");
      setStartedYear(new Date().getFullYear());
      setDescription("");
      setMessage("✓ Our Story deleted successfully");
    } catch (error) {
      setMessage("✗ Failed to delete our story");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Our Story Section</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Our Story</h1>
        <p className="text-sm text-[var(--muted)]">
          Share your studio's journey with an image, founding year, and description.
        </p>
      </div>

      {/* Current Our Story */}
      {ourStory && (
        <div className="card p-6 space-y-4 fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Current Our Story</h2>
            <button
              onClick={handleDelete}
              className="text-xs text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-[var(--border)]">
              <img
                src={ourStory.imageUrl}
                alt="Our Story"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--muted)]">Started Year</p>
                <p className="text-3xl font-[var(--font-heading)] text-[var(--primary)]">
                  {ourStory.startedYear}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Description</p>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  {ourStory.description}
                </p>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Last updated: {new Date(ourStory.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6 fade-in">
        <h2 className="text-lg font-semibold">
          {ourStory ? "Update Our Story" : "Add Our Story"}
        </h2>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Story Image</label>
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
            />
            {imageUrl ? (
              <div className="space-y-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mx-auto"
                />
                <p className="text-xs text-green-600">✓ Image selected</p>
                <p className="text-xs text-[var(--muted)]">Click to change</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl">📸</div>
                <p className="text-sm font-medium">Drag & drop image here</p>
                <p className="text-xs text-[var(--muted)]">or click to browse</p>
              </div>
            )}
          </div>
        </div>

        {/* Started Year */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Started Year</label>
          <input
            type="number"
            value={startedYear}
            onChange={(e) => setStartedYear(parseInt(e.target.value) || 0)}
            min="1900"
            max={new Date().getFullYear()}
            required
            className="input"
            placeholder="2010"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="input resize-none"
            placeholder="Tell your studio's story..."
          />
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

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[#5a1922] disabled:opacity-60 transition-colors"
        >
          {loading ? "Saving..." : ourStory ? "Update Our Story" : "Save Our Story"}
        </button>
      </form>

      {uploading && (
        <div className="card p-4 flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
          <p className="text-sm text-[var(--muted)]">Uploading image...</p>
        </div>
      )}
    </div>
  );
}
