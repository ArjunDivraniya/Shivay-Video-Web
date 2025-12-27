import Sidebar from "@/components/Sidebar";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />
      <main className="flex-1 px-4 sm:px-8 py-8 pb-28 md:pb-8 max-w-6xl mx-auto w-full fade-in">
        {children}
      </main>
    </div>
  );
}
