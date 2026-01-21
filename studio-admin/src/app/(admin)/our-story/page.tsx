"use client";

import { useEffect, useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import { Trash2 } from "lucide-react";

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
  const [message, setMessage] = useState("");
  const [startedYear, setStartedYear] = useState<number>(new Date().getFullYear());
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");

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

  const handleUploadComplete = (data: {
    url: string;
    publicId: string;
    width: number;
    height: number;
  }) => {
    setImageUrl(data.url);
    setImagePublicId(data.publicId);
    setMessage("✓ Image uploaded successfully");
    setTimeout(() => setMessage(""), 3000);
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
      setTimeout(() => setMessage(""), 3000);
      await loadOurStory();
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
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
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("✗ Failed to delete our story");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading && !ourStory) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-600">Our Story Section</p>
          <h1 className="text-3xl font-bold mt-1">Our Story</h1>
        </div>
        <div className="card p-6 text-center">
          <p className="text-sm text-gray-600">Loading our story...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-600">Our Story Section</p>
        <h1 className="text-3xl font-bold mt-1">Our Story</h1>
        <p className="text-sm text-gray-600">
          Share your studio's journey with an image, founding year, and description.
        </p>
      </div>

      {/* Current Our Story */}
      {ourStory && (
        <div className="card p-6 space-y-4 fade-in bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Current Our Story</h2>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-xs text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200">
              <img
                src={ourStory.imageUrl}
                alt="Our Story"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Founded</p>
                <p className="text-4xl font-bold text-blue-600">
                  {ourStory.startedYear}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Our Journey</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {ourStory.description}
                </p>
              </div>
              <p className="text-xs text-gray-500">
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
          <ImageUploader
            sectionType="portrait"
            onUploadComplete={handleUploadComplete}
            onError={(error) => {
              setMessage(`✗ Error: ${error}`);
              setTimeout(() => setMessage(""), 3000);
            }}
            label="Select Story Image"
            existingImageUrl={imageUrl}
          />
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
          <p className="text-xs text-gray-600">The year your studio was founded</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Our Story</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="input resize-none"
            placeholder="Share your studio's inspiring journey and vision..."
          />
          <p className="text-xs text-gray-600">Tell visitors about your passion and experience</p>
        </div>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? "Saving..." : ourStory ? "Update Our Story" : "Save Our Story"}
        </button>
      </form>
    </div>
  );
}
