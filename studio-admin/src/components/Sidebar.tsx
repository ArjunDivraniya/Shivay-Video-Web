"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/hero", label: "Hero Image", icon: "🌄" },
  { href: "/our-story", label: "Our Story", icon: "📜" },
  { href: "/about", label: "About Us", icon: "📊" },
  { href: "/services", label: "Services", icon: "🎯" },
  { href: "/weddings", label: "Wedding Stories", icon: "💒" },
  { href: "/gallery", label: "Photo Gallery", icon: "📸" },
  { href: "/wedding-gallery", label: "Wedding Gallery", icon: "💍" },
  { href: "/films", label: "Films & Cinematics", icon: "🎬" },
  { href: "/reviews", label: "Client Reviews", icon: "⭐" },
  { href: "/footer", label: "Footer", icon: "🔗" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by waiting for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  return (
    <>
      <aside className="hidden md:flex h-screen w-68 flex-col border-r border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-lg sticky top-0 relative overflow-hidden">
        <div className="absolute inset-x-4 top-6 h-32 bg-gradient-to-br from-[var(--primary)]/12 via-[var(--accent)]/10 to-transparent blur-3xl rounded-full" aria-hidden />
        <div className="mb-8 px-6 py-6 relative z-10 flex-shrink-0">
          <div className="text-xl font-[var(--font-heading)] tracking-tight text-[var(--foreground)]">Shivay Admin</div>
          <div className="text-sm text-[var(--muted)]">Premium Studio CMS</div>
        </div>
        <nav className="flex-1 px-4 overflow-y-auto overflow-x-hidden no-scrollbar relative z-10 space-y-1">
          {mounted && links.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all overflow-hidden ${
                  active
                    ? "bg-[var(--primary)]/10 text-[var(--primary)] shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                    : "text-[var(--foreground)]/80 hover:text-[var(--primary)] hover:bg-[var(--border)]"
                }`}
              >
                <span
                  className={`absolute left-0 top-0 h-full w-1 rounded-r-full bg-[var(--primary)] transition-transform duration-200 ${
                    active ? "scale-y-100" : "scale-y-0"
                  }`}
                  aria-hidden
                />
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-base transition-all ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--border)] group-hover:border-[var(--primary)]"
                  }`}
                >
                  {link.icon}
                </span>
                <span className="font-medium tracking-tight">{link.label}</span>
                <span className="ml-auto text-xs text-[var(--muted)] group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-4 px-4 pb-6 border-t border-[var(--border)] relative z-10 flex-shrink-0">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-[var(--primary)] bg-[var(--primary)]/8 hover:bg-[var(--primary)]/12 border border-[var(--border)] transition-colors"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      {mounted && <MobileTabBar pathname={pathname} onLogout={handleLogout} loggingOut={loggingOut} />}
    </>
  );
}

function MobileTabBar({
  pathname,
  onLogout,
  loggingOut,
}: {
  pathname: string | null;
  onLogout: () => Promise<void>;
  loggingOut: boolean;
}) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+14px)] shadow-[0_-12px_40px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {links.map((link) => {
          const active = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`group flex-1 min-w-[92px] text-center rounded-2xl px-3 py-2 text-[11px] font-semibold transition-all ${
                active
                  ? "bg-[var(--primary)]/12 text-[var(--primary)] shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
                  : "text-[var(--foreground)]/80 hover:text-[var(--primary)] hover:bg-[var(--border)]"
              }`}
            >
              <div
                className={`mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-xl border text-base transition-all ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--border)] group-hover:border-[var(--primary)]"
                }`}
              >
                {link.icon}
              </div>
              <span>{link.label}</span>
            </Link>
          );
        })}
        <button
          onClick={onLogout}
          disabled={loggingOut}
          className="flex-1 min-w-[92px] text-center rounded-2xl px-3 py-2 text-[11px] font-semibold text-[var(--primary)] bg-[var(--primary)]/8 hover:bg-[var(--primary)]/12 transition-all"
        >
          {loggingOut ? "Logging..." : "Logout"}
        </button>
      </div>
    </nav>
  );
}
