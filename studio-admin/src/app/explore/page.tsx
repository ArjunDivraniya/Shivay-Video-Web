"use client";

import LoginModal from "@/components/LoginModal";
import { useState, useEffect } from "react";

interface Item {
  _id: string;
  title: string;
}

export default function ExplorePage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setShowLoginModal(true);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setMessage("❌ Please enter a title");
      return;
    }

    // Check auth first
    try {
      const authRes = await fetch("/api/auth/me", { credentials: "include" });
      if (!authRes.ok) {
        setMessage("❌ Please login to create items");
        setShowLoginModal(true);
        return;
      }
    } catch (error) {
      setMessage("❌ Authentication check failed");
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          serviceName: title, 
          serviceType: "Other",
          description: "Demo service created from explore page",
          imageUrl: "https://via.placeholder.com/400x300",
          imagePublicId: "demo-image",
          isActive: true
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create");
      }

      const data = await res.json();
      setMessage("✓ Item created successfully!");
      setTitle("");
      setItems([...items, data]);
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(`❌ ${error.message || "Failed to create item"}`);
      console.error("Create error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
    setMessage("✓ Logged in successfully! You can now create items.");
    await checkAuth();
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] to-[var(--surface)] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-[var(--font-heading)] text-[var(--foreground)] mb-2">
            Explore Page
          </h1>
          <p className="text-[var(--muted)]">
            Try creating an item without logging in - you'll see the login modal!
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border animate-in fade-in ${
            message.startsWith("✓")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {message}
          </div>
        )}

        {/* Create Form */}
        <div className="card p-8 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-[var(--foreground)]">
            Create New Item
          </h2>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]/80">
                Item Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter item title..."
                disabled={loading}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-60 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-semibold hover:bg-[#5a1922] disabled:opacity-60 transition-colors"
            >
              {loading ? "Creating..." : "Create Item"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">💡 Try this:</span> Click "Create Item" without logging in first - a login modal will appear!
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3 text-[var(--foreground)]">
              🔐 Authentication Required
            </h3>
            <p className="text-[var(--muted)] text-sm">
              All CRUD operations check authentication. If you're not logged in, a login modal appears automatically.
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3 text-[var(--foreground)]">
              🎯 Smart Permissions
            </h3>
            <p className="text-[var(--muted)] text-sm">
              Create, Read, Update, Delete operations all respect authentication status. Login once, edit freely.
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3 text-[var(--foreground)]">
              ⚡ Instant Feedback
            </h3>
            <p className="text-[var(--muted)] text-sm">
              Get instant success/error messages. Know exactly what happened with each operation.
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3 text-[var(--foreground)]">
              🔄 Auto Refresh
            </h3>
            <p className="text-[var(--muted)] text-sm">
              After successful operations, data updates automatically. No manual refresh needed.
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="card p-6 mt-6 border-l-4 border-[var(--primary)]">
          <h3 className="text-lg font-semibold mb-3 text-[var(--foreground)]">
            📝 Demo Login Credentials
          </h3>
          <p className="text-[var(--muted)] text-sm mb-2">
            <span className="font-medium">Email:</span> arjundivraniya8@gmail.com
          </p>
          <p className="text-[var(--muted)] text-sm">
            <span className="font-medium">Password:</span> 123456
          </p>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          // Don't allow closing - force login
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
