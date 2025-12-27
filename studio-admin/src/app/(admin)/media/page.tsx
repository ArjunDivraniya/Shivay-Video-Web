"use client";

import { useEffect, useRef, useState } from "react";

interface MediaItem {
  _id: string;
  type: "image" | "video";
  category: string;
  url: string;
  publicId: string;
  thumbnail?: string;
  tags: string[];
  isHomepage: boolean;
  createdAt: string;
}

export default function MediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("wedding");
  const [tags, setTags] = useState("");
  const [isHomepage, setIsHomepage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setMediaList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load media:", error);
      setMediaList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "shivay-studio/media");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const uploadData: any = await uploadRes.json();

      const mediaPayload = {
        type: file.type.startsWith("video/") ? "video" : "image",
        category,
        url: uploadData.secure_url,
        publicId: uploadData.public_id,
        thumbnail: uploadData.eager?.[0]?.secure_url || uploadData.secure_url,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isHomepage,
      };

      const saveRes = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mediaPayload),
      });

      if (!saveRes.ok) throw new Error("Failed to save media");

      setMessage("✓ Media uploaded successfully");
      setCategory("wedding");
      setTags("");
      setIsHomepage(false);
      loadMedia();
    } catch (error: any) {
      setMessage(`✗ ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dragRef.current?.classList.add("border-[var(--accent)]", "bg-[var(--primary)]/5");
  };

  const handleDragLeave = () => {
    dragRef.current?.classList.remove("border-[var(--accent)]", "bg-[var(--primary)]/5");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragRef.current?.classList.remove("border-[var(--accent)]", "bg-[var(--primary)]/5");
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const deleteMedia = async (id: string) => {
    if (!confirm("Delete this media?")) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      loadMedia();
    } catch (error) {
      setMessage("✗ Delete failed");
    }
  };

  const toggleHomepage = async (item: MediaItem) => {
    try {
      const res = await fetch(`/api/media/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHomepage: !item.isHomepage }),
      });
      if (!res.ok) throw new Error("Update failed");
      loadMedia();
    } catch (error) {
      setMessage("✗ Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Gallery</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Media manager</h1>
        <p className="text-sm text-[var(--muted)]">Upload images and videos for your portfolio.</p>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Upload media</h2>

        <div
          ref={dragRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-[var(--accent)]"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-3xl mb-2">☁️</div>
          <p className="font-medium text-[var(--foreground)]">Drag and drop or click to upload</p>
          <p className="text-sm text-[var(--muted)]">Images and videos supported</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => e.target.files?.length && handleUpload(e.target.files[0])}
            disabled={uploading}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={uploading}
            >
              <option>wedding</option>
              <option>pre-wedding</option>
              <option>engagement</option>
              <option>other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <input
              className="input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="mehndi, night"
              disabled={uploading}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isHomepage}
                onChange={(e) => setIsHomepage(e.target.checked)}
                disabled={uploading}
                className="w-4 h-4"
              />
              <span className="text-sm">Show on homepage</span>
            </label>
          </div>
        </div>

        {message && (
          <p
            className={`text-sm p-2 rounded ${
              message.startsWith("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        <button
          disabled={uploading}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[#5a1922] disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Media library</h2>
          <span className="text-sm text-[var(--muted)]">{mediaList.length} items</span>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading...</p>
        ) : mediaList.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No media yet.</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {mediaList.map((item) => (
              <div key={item._id} className="rounded-lg border border-[var(--border)] overflow-hidden">
                <div className="relative aspect-square bg-[var(--border)] group">
                  {item.type === "video" ? (
                    <>
                      <img
                        src={item.thumbnail || item.url}
                        alt={item.category}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                        <span className="text-2xl">▶</span>
                      </div>
                    </>
                  ) : (
                    <img src={item.url} alt={item.category} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 right-2 space-y-2">
                    <button
                      onClick={() => toggleHomepage(item)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.isHomepage
                          ? "bg-[var(--accent)] text-white"
                          : "bg-white/80 text-[var(--primary)]"
                      }`}
                      title="Toggle homepage"
                    >
                      ⭐
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium capitalize">{item.category}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  {item.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-[var(--border)] px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => deleteMedia(item._id)}
                    className="w-full mt-2 text-xs text-red-600 hover:bg-red-50 p-1 rounded"
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
