"use client";

import { useEffect, useRef, useState } from "react";

interface Film {
  _id: string;
  title: string;
  videoUrl: string;
  videoPublicId: string;
  createdAt: string;
}

export default function FilmsPage() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPublicId, setVideoPublicId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFilms();
  }, []);

  const loadFilms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/films");
      const data = await res.json();
      setFilms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load films:", error);
      setFilms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVideo = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      setMessage("✗ Please select a video file");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "shivay-studio/films");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || "Upload failed");
      }

      const uploadData = await uploadRes.json();
      setVideoUrl(uploadData.secure_url);
      setVideoPublicId(uploadData.public_id);
      setMessage("✓ Video uploaded successfully");
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !videoUrl || !videoPublicId) {
      setMessage("✗ Please fill in all fields and upload a video");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/films", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          videoUrl,
          videoPublicId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create film");
      }

      setMessage("✓ Film uploaded successfully!");
      setTitle("");
      setVideoUrl("");
      setVideoPublicId("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadFilms();
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
      handleUploadVideo(files[0]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this film? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/films/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setFilms(films.filter((f) => f._id !== id));
      setMessage("✓ Film deleted successfully");
    } catch (error) {
      setMessage("✗ Failed to delete film");
      console.error(error);
    }
  };

  const handleUpdateTitle = async (id: string) => {
    if (!editTitle.trim()) {
      setMessage("✗ Title cannot be empty");
      return;
    }

    try {
      const res = await fetch(`/api/films/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });

      if (!res.ok) throw new Error("Update failed");

      setFilms(
        films.map((f) =>
          f._id === id ? { ...f, title: editTitle } : f
        )
      );
      setEditingId(null);
      setEditTitle("");
      setMessage("✓ Film title updated");
    } catch (error) {
      setMessage("✗ Failed to update title");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Films & Cinematics</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Video Reels & Cinematics</h1>
        <p className="text-sm text-[var(--muted)]">
          Upload and manage your professional film and cinematic videos.
        </p>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6 fade-in">
        <h2 className="text-lg font-semibold">Upload New Film</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Film Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input"
            placeholder="e.g., Bride & Groom Wedding Cinematic"
          />
        </div>

        {/* Video Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Video File</label>
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
              accept="video/*"
              onChange={(e) => e.target.files && handleUploadVideo(e.target.files[0])}
              className="hidden"
              disabled={uploading}
            />
            {videoUrl ? (
              <div className="space-y-2">
                <div className="text-4xl">✓</div>
                <p className="text-sm font-medium text-green-600">Video uploaded</p>
                <p className="text-xs text-[var(--muted)]">Click to replace</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl">🎬</div>
                <p className="text-sm font-medium">Drag & drop video here</p>
                <p className="text-xs text-[var(--muted)]">or click to browse</p>
              </div>
            )}
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

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[#5a1922] disabled:opacity-60 transition-colors"
        >
          {loading ? "Uploading..." : "Upload Film"}
        </button>
      </form>

      {/* Films List */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Films ({films.length})</h2>
        </div>

        {loading && films.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Loading films...</p>
        ) : films.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No films yet. Upload your first film!</p>
        ) : (
          <div className="space-y-3">
            {films.map((film) => (
              <div
                key={film._id}
                className="border border-[var(--border)] rounded-xl p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Video Preview */}
                  <div className="w-full sm:w-48 h-28 bg-[var(--border)] rounded-lg overflow-hidden flex-shrink-0">
                    <video
                      src={film.videoUrl}
                      className="w-full h-full object-cover"
                      controls={false}
                    />
                  </div>

                  {/* Film Details */}
                  <div className="flex-1 space-y-3">
                    {editingId === film._id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="input flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateTitle(film._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold text-[var(--foreground)]">{film.title}</h3>
                        <p className="text-xs text-[var(--muted)]">
                          {new Date(film.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {editingId !== film._id && (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(film._id);
                              setEditTitle(film.title);
                            }}
                            className="flex-1 text-xs text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors"
                          >
                            Edit Title
                          </button>
                          <button
                            onClick={() => handleDelete(film._id)}
                            className="flex-1 text-xs text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
