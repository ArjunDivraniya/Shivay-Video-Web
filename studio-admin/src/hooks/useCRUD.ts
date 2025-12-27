"use client";

import { useState } from "react";

interface UseCRUDOptions {
  onAuthRequired?: () => void;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useCRUD(options: UseCRUDOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      return res.ok;
    } catch {
      return false;
    }
  };

  const create = async (url: string, body: any) => {
    const isAuth = await checkAuth();
    if (!isAuth) {
      options.onAuthRequired?.();
      return null;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create");
      }

      const data = await res.json();
      options.onSuccess?.(data);
      setLoading(false);
      return data;
    } catch (err: any) {
      const errorMsg = err.message || "Creation failed";
      setError(errorMsg);
      options.onError?.(errorMsg);
      setLoading(false);
      return null;
    }
  };

  const update = async (url: string, body: any) => {
    const isAuth = await checkAuth();
    if (!isAuth) {
      options.onAuthRequired?.();
      return null;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      const data = await res.json();
      options.onSuccess?.(data);
      setLoading(false);
      return data;
    } catch (err: any) {
      const errorMsg = err.message || "Update failed";
      setError(errorMsg);
      options.onError?.(errorMsg);
      setLoading(false);
      return null;
    }
  };

  const delete_ = async (url: string) => {
    const isAuth = await checkAuth();
    if (!isAuth) {
      options.onAuthRequired?.();
      return null;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      const data = await res.json();
      options.onSuccess?.(data);
      setLoading(false);
      return data;
    } catch (err: any) {
      const errorMsg = err.message || "Delete failed";
      setError(errorMsg);
      options.onError?.(errorMsg);
      setLoading(false);
      return null;
    }
  };

  return { create, update, delete: delete_, loading, error, setError };
}
