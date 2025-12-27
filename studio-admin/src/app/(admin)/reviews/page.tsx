"use client";

import { useEffect, useState } from "react";

interface Review {
  _id: string;
  coupleName: string;
  review: string;
  place: string;
  serviceType: string;
  createdAt: string;
}

const SERVICE_TYPES = ["Wedding", "Corporate", "Party", "Other"];

// Review suggestions based on service type
const REVIEW_SUGGESTIONS: Record<string, string[]> = {
  "Wedding": [
    "Absolutely stunning work! They captured every special moment of our wedding day beautifully. Highly recommend!",
    "The team was professional, creative, and made us feel so comfortable. Our photos turned out amazing!",
    "Best decision we made for our wedding! The photos are breathtaking and we'll treasure them forever.",
    "They perfectly captured the emotions and beauty of our special day. Thank you for the wonderful memories!",
    "Exceptional service and incredible photography! Every shot was perfect. Couldn't be happier with the results."
  ],
  "Corporate": [
    "Professional, timely, and delivered excellent quality photos for our corporate event. Highly recommended!",
    "Great experience working with this team. The event coverage was comprehensive and professional.",
    "Outstanding work on our company event. The photos exceeded our expectations!",
    "Very professional service and high-quality results for our business conference. Will hire again!",
    "Excellent corporate photography! They understood our brand and delivered perfect shots."
  ],
  "Party": [
    "Amazing photos from our celebration! They captured the fun and energy perfectly.",
    "The team was fantastic! Everyone had a great time and the photos are incredible.",
    "Great service and wonderful photos from our party. Highly recommend for any celebration!",
    "They made our event so memorable with their photography. Fun, professional, and talented!",
    "Perfect party coverage! The candid shots are amazing and everyone loved the experience."
  ],
  "default": [
    "Excellent service and amazing quality! Highly recommend to anyone looking for professional photography.",
    "Very professional and talented! The results exceeded our expectations.",
    "Great experience working with them. The photos are absolutely stunning!",
    "Highly recommend! Professional, creative, and delivered exceptional quality.",
    "Outstanding work! They truly captured what we envisioned. Very happy with the service!"
  ]
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<{ serviceType: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [coupleName, setCoupleName] = useState("");
  const [review, setReview] = useState("");
  const [place, setPlace] = useState("");
  const [serviceType, setServiceType] = useState("Wedding");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ coupleName: "", review: "", place: "", serviceType: "Wedding" });

  useEffect(() => {
    loadReviews();
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

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coupleName.trim() || !review.trim() || !place.trim() || !serviceType) {
      setMessage("✗ Please fill in all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupleName,
          review,
          place,
          serviceType,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add review");
      }

      setMessage("✓ Review added successfully!");
      setCoupleName("");
      setReview("");
      setPlace("");
      setServiceType("Wedding");
      setShowSuggestions(false);
      await loadReviews();
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = () => {
    const type = serviceType === "Other" ? "default" : serviceType;
    return REVIEW_SUGGESTIONS[type] || REVIEW_SUGGESTIONS["default"];
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setReviews(reviews.filter((r) => r._id !== id));
      setMessage("✓ Review deleted successfully");
    } catch (error) {
      setMessage("✗ Failed to delete review");
      console.error(error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editData.coupleName.trim() || !editData.review.trim() || !editData.place.trim()) {
      setMessage("✗ Please fill in all fields");
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!res.ok) throw new Error("Update failed");

      setReviews(
        reviews.map((r) =>
          r._id === editingId ? { ...r, ...editData } : r
        )
      );
      setEditingId(null);
      setMessage("✓ Review updated successfully");
    } catch (error) {
      setMessage("✗ Failed to update review");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Reviews</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Client Reviews & Testimonials</h1>
        <p className="text-sm text-[var(--muted)]">
          Manage feedback and reviews from your clients.
        </p>
      </div>

      {/* Add Review Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6 fade-in">
        <h2 className="text-lg font-semibold">Add New Review</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Couple Name / Client Name</label>
            <input
              type="text"
              value={coupleName}
              onChange={(e) => setCoupleName(e.target.value)}
              required
              className="input"
              placeholder="John & Jane Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
              className="input"
            >
              {Array.from(new Set([
                ...SERVICE_TYPES,
                ...services.map(s => s.serviceType)
              ])).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Location / Place</label>
          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            required
            className="input"
            placeholder="e.g., Delhi, Mumbai, Jaipur"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Review / Testimonial</label>
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              {showSuggestions ? "Hide suggestions" : "Show suggestions"}
            </button>
          </div>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
            className="input resize-none"
            placeholder="Share the client's feedback about your service..."
            rows={4}
          />
          <p className="text-xs text-[var(--muted)]">
            Client's feedback and testimonial about your service
          </p>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="mt-3 p-3 bg-[var(--primary)]/5 rounded-lg border border-[var(--border)] space-y-2">
              <p className="text-xs font-medium text-[var(--muted)]">Suggested reviews for {serviceType}:</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getSuggestions().map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setReview(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left p-2 text-sm hover:bg-[var(--primary)]/10 rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--muted)] italic pt-2">
                💡 Tip: You can use these as templates and customize them for your client
              </p>
            </div>
          )}
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
          disabled={loading}
          className="w-full px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[#5a1922] disabled:opacity-60 transition-colors"
        >
          {loading ? "Adding..." : "Add Review"}
        </button>
      </form>

      {/* Reviews List */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Reviews ({reviews.length})</h2>
        </div>

        {loading && reviews.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No reviews yet. Add your first review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="border border-[var(--border)] rounded-xl p-4 hover:shadow-lg transition-shadow"
              >
                {editingId === r._id ? (
                  // Edit Form
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        type="text"
                        value={editData.coupleName}
                        onChange={(e) => setEditData({ ...editData, coupleName: e.target.value })}
                        className="input"
                        placeholder="Couple Name"
                      />
                      <input
                        type="text"
                        value={editData.place}
                        onChange={(e) => setEditData({ ...editData, place: e.target.value })}
                        className="input"
                        placeholder="Place"
                      />
                    </div>
                    <select
                      value={editData.serviceType}
                      onChange={(e) => setEditData({ ...editData, serviceType: e.target.value })}
                      className="input w-full"
                    >
                      {Array.from(new Set([
                        ...SERVICE_TYPES,
                        ...services.map(s => s.serviceType)
                      ])).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={editData.review}
                      onChange={(e) => setEditData({ ...editData, review: e.target.value })}
                      className="input resize-none w-full"
                      rows={3}
                      placeholder="Review"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // Review Display
                  <>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-[var(--foreground)]">{r.coupleName}</h3>
                          <p className="text-sm text-[var(--muted)]">📍 {r.place}</p>
                        </div>
                        <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold rounded-full">
                          {r.serviceType}
                        </span>
                      </div>

                      <p className="text-sm text-[var(--foreground)] leading-relaxed italic">
                        "{r.review}"
                      </p>

                      <p className="text-xs text-[var(--muted)]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(r._id);
                          setEditData({
                            coupleName: r.coupleName,
                            review: r.review,
                            place: r.place,
                            serviceType: r.serviceType,
                          });
                        }}
                        className="flex-1 text-xs text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="flex-1 text-xs text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
