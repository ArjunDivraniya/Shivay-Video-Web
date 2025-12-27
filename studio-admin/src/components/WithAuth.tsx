"use client";

import LoginModal from "@/components/LoginModal";
import { useEffect, useState } from "react";

interface WithAuthProps {
  children: React.ReactNode;
}

/**
 * Wrapper that shows login modal for unauthenticated users
 * and protects CRUD operations
 */
export default function WithAuth({ children }: WithAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const isAuth = res.ok;
      setIsAuthenticated(isAuth);
      
      // If not authenticated, show login modal
      if (!isAuth) {
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setShowLoginModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    await checkAuth();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="text-4xl mb-4">✨</div>
          <p className="text-[var(--muted)]">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <LoginModal
        isOpen={showLoginModal && !isAuthenticated}
        onClose={() => {
          // Don't allow closing without logging in
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
