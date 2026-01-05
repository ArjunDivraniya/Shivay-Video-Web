"use client";

import { useEffect, useRef, useState } from "react";
import { useUpload } from "@/hooks/useUpload";

interface StoryFormData {
  title: string;
  eventType: string;
  location: string;
  coverImageUrl: string;
  coverImageId: string;
  tags: string;
  isFeatured: boolean;
  showOnHomepage: boolean;
}

const emptyStory: StoryFormData = {
  title: "",
  eventType: "",
  location: "",
  coverImageUrl: "",
  coverImageId: "",
  tags: "",
  isFeatured: false,
  showOnHomepage: false,
};

export default function StoriesPage() {
  const [form, setForm] = useState<StoryFormData>(emptyStory);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stories, setStories] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const { uploading, progress, uploadFile } = useUpload();

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const res = await fetch("/api/stories");
      const data = await res.json();
      setStories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load stories:", error);
      setStories([]);
    }
  };

  const handleUploadCoverImage = async (file: File) => {
    try {
      setMessage("Uploading cover image...");

      const data: any = await uploadFile(file, {
        folder: "shivay-studio/stories",
        onProgress: (p) => {
          setMessage(`Uploading cover image... ${p.percentage}%`);
        },
        onError: (error) => {
          setMessage(`✗ Upload failed: ${error}`);
        },
        onSuccess: () => {
          setMessage("✓ Cover image uploaded");
        },
      });

      setForm({
        ...form,
        coverImageUrl: data.secure_url,
        coverImageId: data.public_id,
      });
    } catch (error: any) {
      setMessage(`✗ Upload failed: ${error.message}`);
    }
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
      handleUploadCoverImage(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (
        !form.title ||
        !form.eventType ||
        !form.location ||
        !form.coverImageUrl ||
        !form.coverImageId
      ) {
        throw new Error("Please fill in all required fields");
      }

      const payload = {
        title: form.title,
        eventType: form.eventType,
        location: form.location,
        coverImage: {
          url: form.coverImageUrl,
          publicId: form.coverImageId,
        },
        gallery: [],
        videos: [],
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isFeatured: form.isFeatured,
        showOnHomepage: form.showOnHomepage,
      };

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to save story");
      }

      setMessage("✓ Story saved successfully!");
      setForm(emptyStory);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadStories();
    } catch (err: any) {
      setMessage(`✗ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm("Delete this story? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/stories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setStories(stories.filter((s) => s._id !== id));
      setMessage("✓ Story deleted");
    } catch (error) {
      setMessage("✗ Failed to delete story");
    }
  };

  const toggleFeatured = async (story: any) => {
    try {
      const res = await fetch(`/api/stories/${story._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !story.isFeatured }),
      });

      if (!res.ok) throw new Error("Update failed");

      setStories(
        stories.map((s) =>
          s._id === story._id ? { ...s, isFeatured: !s.isFeatured } : s
        )
      );
      setMessage("✓ Featured status updated");
    } catch (error) {
      setMessage("✗ Failed to update");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
          Stories
        </p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">
          Story manager
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Create weddings and events, attach cover, tags, and visibility flags.
        </p>
      </div>

      <div className="card p-6 space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">New story</h2>
          <span className="text-xs text-[var(--muted)]">
            Drag & drop or click to upload cover image
          </span>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Title" required>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Wedding - John & Jane"
                required
              />
            </Field>
            <Field label="Event type" required>
              <input
                className="input"
                value={form.eventType}
                onChange={(e) =>
                  setForm({ ...form, eventType: e.target.value })
                }
                placeholder="Wedding, Engagement, etc"
                required
              />
            </Field>
            <Field label="Location" required>
              <input
                className="input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Mumbai, India"
                required
              />
            </Field>
          </div>

          {/* Cover Image Upload */}
          <Field label="Cover Image" required>
            <div
              ref={dragRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files && handleUploadCoverImage(e.target.files[0])
                }
                className="hidden"
              />
              {form.coverImageUrl ? (
                <div className="space-y-2">
                  <img
                    src={form.coverImageUrl}
                    alt="cover preview"
                    className="w-full h-32 object-cover rounded"
                  />
                  <p className="text-xs text-green-600">✓ Image selected</p>
                  <p className="text-xs text-[var(--muted)]">
                    Click to change or drag new image
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Drag cover image here
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    or click to browse
                  </p>
                </div>
              )}
            </div>
          </Field>

          <Field label="Tags (comma separated)">
            <input
              className="input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="wedding, traditional, garden"
            />
          </Field>

          <div className="flex flex-wrap gap-4">
            <Toggle
              label="Featured"
              checked={form.isFeatured}
              onChange={(checked) =>
                setForm({ ...form, isFeatured: checked })
              }
            />
            <Toggle
              label="Show on homepage"
              checked={form.showOnHomepage}
              onChange={(checked) =>
                setForm({ ...form, showOnHomepage: checked })
              }
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.includes("✓") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          {uploading && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                <p className="text-sm text-blue-700">Uploading image...</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 ease-out flex items-center justify-center text-[10px] text-white font-semibold"
                  style={{ width: `${progress?.percentage || 0}%` }}
                >
                  {(progress?.percentage || 0) > 10 && `${progress?.percentage}%`}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-fit rounded-lg px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[#5a1922] disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Saving..." : "Save story"}
          </button>
        </form>
      </div>

      {/* Stories List */}
      <div className="card p-6 space-y-4 fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Stories</h2>
          <span className="text-sm text-[var(--muted)]">{stories.length} total</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {stories.map((story) => (
            <div
              key={story._id}
              className="rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface)] hover:shadow-lg transition-shadow"
            >
              {story.coverImage?.url && (
                <img
                  src={story.coverImage.url}
                  alt={story.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{story.title}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {story.eventType} • {story.location}
                    </p>
                  </div>
                  {story.isFeatured && (
                    <span className="rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs px-3 py-1 whitespace-nowrap">
                      Featured
                    </span>
                  )}
                </div>
                {story.tags?.length > 0 && (
                  <p className="text-xs text-[var(--muted)]">
                    Tags: {story.tags.join(", ")}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => toggleFeatured(story)}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    {story.isFeatured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    onClick={() => handleDeleteStory(story._id)}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {stories.length === 0 && (
            <p className="text-sm text-[var(--muted)]">No stories yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium text-[var(--foreground)]/80">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--accent)]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
