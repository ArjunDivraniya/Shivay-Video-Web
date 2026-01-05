"use client";

import { useEffect, useRef, useState } from "react";
import { useUpload } from "@/hooks/useUpload";

interface Film {
  _id: string;
  title: string;
  category: string;
  serviceType: string;
  videoUrl: string;
  videoPublicId: string;
  createdAt: string;
}

const FILM_CATEGORIES = ["Wedding Film", "Cinematic", "Promo", "Event", "Other"];
const SERVICE_TYPES = ["Wedding", "Corporate", "Party", "Other"];

export default function FilmsPage() {
  const [films, setFilms] = useState<Film[]>([]);
  const [services, setServices] = useState<{ serviceType: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Wedding Film");
  const [serviceType, setServiceType] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPublicId, setVideoPublicId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editServiceType, setEditServiceType] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const { uploading, progress, uploadFile } = useUpload();

  useEffect(() => {
    loadFilms();
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

    try {
      setMessage("Uploading video...");
      
      const uploadData: any = await uploadFile(file, {
        folder: "shivay-studio/films",
        onProgress: (p) => {
          setMessage(`Uploading video... ${p.percentage}%`);
        },
        onError: (error) => {
          setMessage(`✗ Error: ${error}`);
        },
        onSuccess: () => {
          setMessage("✓ Video uploaded successfully");
        },
      });

      setVideoUrl(uploadData.secure_url);
      setVideoPublicId(uploadData.public_id);
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !category || !videoUrl || !videoPublicId) {
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
          category,
          serviceType,
          videoUrl,
          videoPublicId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create film");
      }

      setMessage("✓ Film uploaded successfully!");
      setTitle("");
      setCategory("Wedding Film");
      setServiceType("");
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
        body: JSON.stringify({ 
          title: editTitle,
          category: editCategory,
          serviceType: editServiceType
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      setFilms(
        films.map((f) =>
          f._id === id ? { ...f, title: editTitle, category: editCategory, serviceType: editServiceType } : f
        )
      );
      setEditingId(null);
      setEditTitle("");
      setEditCategory("");
      setEditServiceType("");
      setMessage("✓ Film updated");
    } catch (error) {
      setMessage("✗ Failed to update film");
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Film Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
              placeholder="e.g., Priya & Rahul's Wedding Film"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Film Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="input"
            >
              {FILM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Service Type */}
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
          <p className="text-xs text-gray-500">Link this film to a specific service type</p>
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

        {uploading && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              <p className="text-sm text-blue-700">Uploading video...</p>
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

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[#5a1922] disabled:opacity-60 transition-colors"
        >
          {loading ? "Uploading..." : "Upload Film"}
        </button>
      </form>

      {/* Films Grid */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Films ({films.length})</h2>
        </div>

        {loading && films.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Loading films...</p>
        ) : films.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No films yet. Upload your first film!</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {films.map((film) => (
              <div
                key={film._id}
                className="group relative rounded-xl overflow-hidden border border-[var(--border)] hover:shadow-xl transition-all duration-300"
              >
                {/* Video Container */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  <video
                    src={film.videoUrl}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-3 border-white/50 flex items-center justify-center group-hover:border-white group-hover:bg-white/10 transition-all duration-300">
                      <span className="text-white text-2xl ml-1">▶</span>
                    </div>
                  </div>
                </div>

                {/* Film Info Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-100 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                      {film.category}
                    </p>
                    <h3 className="text-lg font-serif text-white font-semibold leading-tight">
                      {film.title}
                    </h3>
                  </div>
                </div>

                {/* Action Buttons (Edit/Delete) */}
                {editingId !== film._id && (
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => {
                        setEditingId(film._id);
                        setEditTitle(film.title);
                        setEditCategory(film.category);
                      }}
                      className="p-2 bg-blue-600/90 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(film._id)}
                      className="p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="card p-6 space-y-4 border-2 border-blue-500">
          <h3 className="text-lg font-semibold">Edit Film</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="input"
              >
                {FILM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateTitle(editingId)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
