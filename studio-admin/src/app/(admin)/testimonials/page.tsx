"use client";

import { useEffect, useRef, useState } from "react";

interface Testimonial {
  _id: string;
  clientName: string;
  quote: string;
  image?: { url: string; publicId: string };
  approved: boolean;
  createdAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [clientName, setClientName] = useState("");
  const [quote, setQuote] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageId, setImageId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load testimonials:", error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "shivay-studio/testimonials");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setImageUrl(data.secure_url);
      setImageId(data.public_id);
      setMessage("✓ Image uploaded");
    } catch (error) {
      setMessage("✗ Image upload failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !quote.trim()) {
      setMessage("✗ Please fill in all fields");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const payload: any = {
        clientName,
        quote,
        approved: false,
      };

      if (imageUrl && imageId) {
        payload.image = { url: imageUrl, publicId: imageId };
      }

      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save testimonial");

      setMessage("✓ Testimonial submitted for approval!");
      setClientName("");
      setQuote("");
      setImageUrl("");
      setImageId("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadTestimonials();
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !approved }),
      });

      if (!res.ok) throw new Error("Update failed");

      setTestimonials(
        testimonials.map((t) =>
          t._id === id ? { ...t, approved: !t.approved } : t
        )
      );
      setMessage(`✓ Testimonial ${!approved ? "approved" : "unapproved"}`);
    } catch (error) {
      setMessage("✗ Failed to update testimonial");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;

    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setTestimonials(testimonials.filter((t) => t._id !== id));
      setMessage("✓ Testimonial deleted");
    } catch (error) {
      setMessage("✗ Failed to delete testimonial");
    }
  };

  const approved = testimonials.filter((t) => t.approved);
  const pending = testimonials.filter((t) => !t.approved);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
          Testimonials
        </p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">
          Client love
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Collect quotes, approve, and keep brand visuals aligned.
        </p>
      </div>

      {/* Add New Testimonial */}
      <div className="card p-6 space-y-4">
        <h2 className="font-[var(--font-heading)] text-lg">Add Testimonial</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase text-[var(--muted)]">
              Client Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              disabled={uploading}
              placeholder="John & Jane Doe"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase text-[var(--muted)]">
              Quote
            </label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              disabled={uploading}
              placeholder="Their wonderful words about your work..."
              rows={4}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase text-[var(--muted)]">
              Client Photo (Optional)
            </label>
            <div className="mt-2 flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files && handleUploadImage(e.target.files[0])
                }
                disabled={uploading}
                className="text-sm"
              />
              {imageUrl && (
                <div className="w-16 h-16 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
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

          <button
            type="submit"
            disabled={uploading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
          >
            {uploading ? "Submitting..." : "Submit for Approval"}
          </button>
        </form>
      </div>

      {/* Approved Testimonials */}
      {approved.length > 0 && (
        <div className="card p-6">
          <h2 className="font-[var(--font-heading)] text-lg mb-4">
            Approved ({approved.length})
          </h2>

          <div className="space-y-4">
            {approved.map((testimonial) => (
              <div
                key={testimonial._id}
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-start gap-4">
                  {testimonial.image && (
                    <img
                      src={testimonial.image.url}
                      alt={testimonial.clientName}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">
                      {testimonial.clientName}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1 italic">
                      "{testimonial.quote}"
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleApprove(testimonial._id, testimonial.approved)
                      }
                      className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      Unapprove
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial._id)}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Testimonials */}
      {pending.length > 0 && (
        <div className="card p-6">
          <h2 className="font-[var(--font-heading)] text-lg mb-4">
            Pending Approval ({pending.length})
          </h2>

          <div className="space-y-4">
            {pending.map((testimonial) => (
              <div
                key={testimonial._id}
                className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-start gap-4">
                  {testimonial.image && (
                    <img
                      src={testimonial.image.url}
                      alt={testimonial.clientName}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">
                      {testimonial.clientName}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1 italic">
                      "{testimonial.quote}"
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleApprove(testimonial._id, testimonial.approved)
                      }
                      className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial._id)}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading testimonials...</p>
      ) : testimonials.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-[var(--muted)]">
            No testimonials yet. Add one above to get started!
          </p>
        </div>
      ) : null}
    </div>
  );
}
