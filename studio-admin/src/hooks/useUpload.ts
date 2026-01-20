"use client";

import { useState } from "react";

interface UploadProgress {
  percentage: number;
  loaded: number;
  total: number;
}

interface UploadOptions {
  folder?: string;
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    percentage: 0,
    loaded: 0,
    total: 0,
  });

  const uploadFile = async (file: File, options: UploadOptions = {}) => {
    const { folder = "shivay-studio", onProgress, onSuccess, onError } = options;

    setUploading(true);
    setProgress({ percentage: 0, loaded: 0, total: 0 });

    try {
      // Early size validation for better UX
      const MAX_IMAGE_MB = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB || 10);
      const MAX_VIDEO_MB = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE_MB || 100);
      const sizeMB = Math.round((file.size / (1024 * 1024)) * 100) / 100;
      const isVideo = file.type.startsWith("video/");
      if (!isVideo && sizeMB > MAX_IMAGE_MB) {
        const msg = `Image too large: ${sizeMB}MB. Max ${MAX_IMAGE_MB}MB.`;
        onError?.(msg);
        setUploading(false);
        throw new Error(msg);
      }
      if (isVideo && sizeMB > MAX_VIDEO_MB) {
        const msg = `Video too large: ${sizeMB}MB. Max ${MAX_VIDEO_MB}MB.`;
        onError?.(msg);
        setUploading(false);
        throw new Error(msg);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentage = Math.round((e.loaded / e.total) * 100);
            const progressData = {
              percentage,
              loaded: e.loaded,
              total: e.total,
            };
            setProgress(progressData);
            onProgress?.(progressData);
          }
        });

        // Handle completion
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              setUploading(false);
              setProgress({ percentage: 100, loaded: 0, total: 0 });
              onSuccess?.(data);
              resolve(data);
            } catch (error) {
              const errorMsg = "Failed to parse response";
              setUploading(false);
              onError?.(errorMsg);
              reject(new Error(errorMsg));
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              const errorMsg = error.error || "Upload failed";
              setUploading(false);
              onError?.(errorMsg);
              reject(new Error(errorMsg));
            } catch {
              const errorMsg = "Upload failed";
              setUploading(false);
              onError?.(errorMsg);
              reject(new Error(errorMsg));
            }
          }
        });

        // Handle errors
        xhr.addEventListener("error", () => {
          const errorMsg = "Network error during upload";
          setUploading(false);
          onError?.(errorMsg);
          reject(new Error(errorMsg));
        });

        // Handle abort
        xhr.addEventListener("abort", () => {
          const errorMsg = "Upload cancelled";
          setUploading(false);
          onError?.(errorMsg);
          reject(new Error(errorMsg));
        });

        // Send request
        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });
    } catch (error: any) {
      setUploading(false);
      const errorMsg = error.message || "Upload failed";
      onError?.(errorMsg);
      throw error;
    }
  };

  const uploadMultipleFiles = async (
    files: File[],
    options: UploadOptions = {}
  ) => {
    const results: any[] = [];
    const errors: string[] = [];
    
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Update progress to show which file is being uploaded
        const fileProgress = {
          percentage: 0,
          loaded: i,
          total: files.length,
        };
        setProgress(fileProgress);

        const result = await uploadFile(file, {
          ...options,
          onProgress: (p) => {
            // Combine file index progress with individual file progress
            const overallPercentage = Math.round(
              ((i + p.percentage / 100) / files.length) * 100
            );
            setProgress({
              percentage: overallPercentage,
              loaded: i + 1,
              total: files.length,
            });
            options.onProgress?.({
              percentage: overallPercentage,
              loaded: i + 1,
              total: files.length,
            });
          },
        });
        results.push(result);
      } catch (error: any) {
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    setUploading(false);
    setProgress({ percentage: 0, loaded: 0, total: 0 });

    if (errors.length > 0) {
      const errorMsg = `Failed to upload ${errors.length} file(s): ${errors.join(", ")}`;
      options.onError?.(errorMsg);
      if (results.length === 0) {
        throw new Error(errorMsg);
      }
    }

    if (results.length > 0) {
      options.onSuccess?.(results);
    }

    return results;
  };

  const reset = () => {
    setUploading(false);
    setProgress({ percentage: 0, loaded: 0, total: 0 });
  };

  return {
    uploading,
    progress,
    uploadFile,
    uploadMultipleFiles,
    reset,
  };
}
