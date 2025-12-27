"use client";

import { useEffect, useState } from "react";

interface Footer {
  _id: string;
  phone: string;
  email: string;
  instagram: string;
  youtube: string;
  facebook: string;
  createdAt: string;
}

export default function FooterPage() {
  const [footer, setFooter] = useState<Footer | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [facebook, setFacebook] = useState("");

  useEffect(() => {
    loadFooter();
  }, []);

  const loadFooter = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/footer");
      if (res.ok) {
        const data = await res.json();
        setFooter(data);
        setPhone(data.phone);
        setEmail(data.email);
        setInstagram(data.instagram);
        setYoutube(data.youtube);
        setFacebook(data.facebook);
      }
    } catch (error) {
      console.error("Failed to load footer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || !email.trim()) {
      setMessage("✗ Phone and email are required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (!footer) {
        // Create new footer data
        const res = await fetch("/api/footer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            email,
            instagram,
            youtube,
            facebook,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to create footer data");
        }

        const data = await res.json();
        setFooter(data);
        setMessage("✓ Footer data created successfully!");
      } else {
        // Update existing footer data
        const res = await fetch(`/api/footer/${footer._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            email,
            instagram,
            youtube,
            facebook,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to update footer data");
        }

        const data = await res.json();
        setFooter(data);
        setMessage("✓ Footer data updated successfully!");
      }
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Footer Details</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Contact & Social Links</h1>
        <p className="text-sm text-[var(--muted)]">
          Manage your contact information and social media links displayed in the footer.
        </p>
      </div>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6 fade-in">
        <h2 className="text-lg font-semibold">Footer Information</h2>

        {/* Contact Information */}
        <div className="space-y-4 border-b border-[var(--border)] pb-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Contact Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">📞 Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="input"
                placeholder="+91 XXXXX XXXXX"
              />
              <p className="text-xs text-[var(--muted)]">Primary contact number</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">✉️ Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="contact@example.com"
              />
              <p className="text-xs text-[var(--muted)]">Business email address</p>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Social Media Links</h3>
          <p className="text-xs text-[var(--muted)]">
            Paste your full profile URLs (including https://)
          </p>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">📸 Instagram</label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="input"
                placeholder="https://instagram.com/yourprofile"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">🎥 YouTube</label>
              <input
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className="input"
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">👍 Facebook</label>
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="input"
                placeholder="https://facebook.com/yourpage"
              />
            </div>
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
          disabled={loading}
          className="w-full px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[#5a1922] disabled:opacity-60 transition-colors"
        >
          {loading ? "Saving..." : footer ? "Update Footer" : "Create Footer"}
        </button>
      </form>

      {/* Preview Cards */}
      {footer && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="card p-4 text-center space-y-3 border-l-4 border-[var(--primary)]">
            <p className="text-2xl">📞</p>
            <p className="text-sm font-medium text-[var(--foreground)]">Phone</p>
            <a href={`tel:${footer.phone}`} className="text-xs text-[var(--accent)] hover:underline break-all">
              {footer.phone}
            </a>
          </div>

          <div className="card p-4 text-center space-y-3 border-l-4 border-[var(--accent)]">
            <p className="text-2xl">✉️</p>
            <p className="text-sm font-medium text-[var(--foreground)]">Email</p>
            <a href={`mailto:${footer.email}`} className="text-xs text-[var(--accent)] hover:underline break-all">
              {footer.email}
            </a>
          </div>

          {footer.instagram && (
            <div className="card p-4 text-center space-y-3 border-l-4 border-pink-500">
              <p className="text-2xl">📸</p>
              <p className="text-sm font-medium text-[var(--foreground)]">Instagram</p>
              <a href={footer.instagram} target="_blank" rel="noopener noreferrer" className="text-xs text-pink-600 hover:underline">
                Visit
              </a>
            </div>
          )}

          {footer.youtube && (
            <div className="card p-4 text-center space-y-3 border-l-4 border-red-500">
              <p className="text-2xl">🎥</p>
              <p className="text-sm font-medium text-[var(--foreground)]">YouTube</p>
              <a href={footer.youtube} target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 hover:underline">
                Visit
              </a>
            </div>
          )}

          {footer.facebook && (
            <div className="card p-4 text-center space-y-3 border-l-4 border-blue-600">
              <p className="text-2xl">👍</p>
              <p className="text-sm font-medium text-[var(--foreground)]">Facebook</p>
              <a href={footer.facebook} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                Visit
              </a>
            </div>
          )}
        </div>
      )}

      {/* Guidelines */}
      <div className="card p-6 bg-blue-50 border border-blue-200 space-y-3">
        <p className="text-sm font-semibold text-blue-900">📋 Guidelines</p>
        <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
          <li>Phone: Include country code and proper formatting</li>
          <li>Email: Use a valid, monitored email address</li>
          <li>Social Links: Paste complete URLs with https://</li>
          <li>All social media links are optional</li>
          <li>Links will open in a new tab when clicked</li>
        </ul>
      </div>
    </div>
  );
}
