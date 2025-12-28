"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Login failed");
        setLoading(false);
        return;
      }

      const data = await res.json();
      
      if (data.success) {
        // Add small delay to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Use window.location for reliable redirect on deployment
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="card w-full max-w-md p-8 fade-in">
        <div className="text-center mb-6">
          <div className="text-2xl font-[var(--font-heading)] text-[var(--foreground)]">
            Shivay Studio Admin
          </div>
          <p className="text-sm text-[var(--muted)]">Premium wedding studio CMS</p>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]/80">Email</label>
            <input
              type="email"
              name="username"
              autoComplete="username"
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]/80">Password</label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"

              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[#5a1922] disabled:opacity-60 transition-colors"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        
      </div>
    </div>
  );
}
