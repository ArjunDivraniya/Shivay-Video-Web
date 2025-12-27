"use client";

import { useEffect, useRef, useState } from "react";

interface Reel {
  _id: string;
  title: string;
  videoUrl: string;
  publicId: string;
  thumbnail?: string;
  showOnHomepage: boolean;
  createdAt: string;
}

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reels");
      const data = await res.json();
      setReels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load reels:", error);
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!title.trim()) {
      setMessage("✗ Please enter a reel title");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "shivay-studio/reels");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || "Upload failed");
      }

      const uploadData = await uploadRes.json();

      const reelPayload = {
        title,
        videoUrl: uploadData.secure_url,
        publicId: uploadData.public_id,
        thumbnail:
          uploadData.eager?.[0]?.secure_url ||
          uploadData.thumbnail_url ||
          undefined,
        showOnHomepage,
      };

      const dbRes = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reelPayload),
      });

      if (!dbRes.ok) {
        throw new Error("Failed to save to database");
      }

      setMessage("✓ Reel uploaded successfully!");
      setTitle("");
      setShowOnHomepage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadReels();
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("video/")) {
      setMessage("✗ Please select a video file");
      return;
    }
    handleUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragRef.current) {
      dragRef.current.classList.add("border-blue-500", "bg-blue-50");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
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
      handleFileSelect(files[0]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this reel? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/reels/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setReels(reels.filter((r) => r._id !== id));
      setMessage("✓ Reel deleted successfully");
    } catch (error) {
      setMessage("✗ Failed to delete reel");
      console.error(error);
    }
  };

  const toggleHomepage = async (reel: Reel) => {
    try {
      const res = await fetch(`/api/reels/${reel._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showOnHomepage: !reel.showOnHomepage }),
      });

      if (!res.ok) throw new Error("Update failed");

      setReels(
        reels.map((r) =>
          r._id === reel._id
            ? { ...r, showOnHomepage: !r.showOnHomepage }
            : r
        )
      );
      setMessage("✓ Homepage visibility updated");
    } catch (error) {
      setMessage("✗ Failed to update");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
          Reels
        </p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">
          Reel manager
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Short cinematic videos with homepage toggle.
        </p>
      </div>

      {/* Upload Section */}
      <div className="card p-6 space-y-4">
        <h2 className="font-[var(--font-heading)] text-lg">Upload Reel</h2>

        <div
          ref={dragRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) =>
              e.target.files && handleFileSelect(e.target.files[0])
            }
            className="hidden"
          />
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Drag & drop your video here
            </p>
            <p className="text-xs text-[var(--muted)]">
              or click to browse (MP4, WebM, MOV)
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium uppercase text-[var(--muted)]">
            Reel Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
            placeholder="e.g., Wedding Highlights - 2024"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnHomepage}
            onChange={(e) => setShowOnHomepage(e.target.checked)}
            disabled={uploading}
          />
          <span className="text-sm">Show on homepage</span>
        </label>

        {message && (
          <p
            className={`text-sm ${
              message.includes("✓") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
      </div>

      {/* Reels Grid */}
      <div className="card p-6">
        <h2 className="font-[var(--font-heading)] text-lg mb-4">
          All Reels ({reels.length})
        </h2>

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading reels...</p>
        ) : reels.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No reels uploaded yet. Start by uploading a video!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reels.map((reel) => (
              <div key={reel._id} className="relative group">
                <div className="aspect-video overflow-hidden rounded-lg bg-gray-200">
                  <video
                    className="w-full h-full object-cover"
                    poster={reel.thumbnail}
                  >
                    <source src={reel.videoUrl} />
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={() => toggleHomepage(reel)}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    title={reel.showOnHomepage ? "Remove from homepage" : "Add to homepage"}
                  >
                    {reel.showOnHomepage ? "★" : "☆"}
                  </button>
                  <button
                    onClick={() => handleDelete(reel._id)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Info */}
                <div className="mt-3 space-y-1">
                  <h3 className="font-medium text-sm truncate">{reel.title}</h3>
                  {reel.showOnHomepage && (
                    <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      On Homepage
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
