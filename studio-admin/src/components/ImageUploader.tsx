"use client";

import React, { useState, useCallback, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { X, ZoomIn, ZoomOut, Upload, Loader2, Check, AlertCircle } from "lucide-react";
import {
  createCroppedImage,
  getPixelCrop,
  validateImageFile,
} from "@/lib/canvasUtils";

// Section type to aspect ratio mapping
const ASPECT_RATIOS = {
  hero: 16 / 9, // Widescreen hero banners
  portrait: 4 / 5, // Portrait mode (Instagram style)
  square: 1 / 1, // Perfect square
  gallery: 1 / 1, // Gallery grid items
  thumbnail: 16 / 9, // Video thumbnails
  wide: 21 / 9, // Ultra-wide banners
} as const;

const SECTION_LABELS = {
  hero: "Hero Banner",
  portrait: "Portrait Image",
  square: "Square Image",
  gallery: "Gallery Image",
  thumbnail: "Thumbnail",
  wide: "Wide Banner",
} as const;

const RECOMMENDED_DIMENSIONS = {
  hero: "1920×1080px (16:9)",
  portrait: "1080×1350px (4:5)",
  square: "1080×1080px (1:1)",
  gallery: "1080×1080px (1:1)",
  thumbnail: "1920×1080px (16:9)",
  wide: "2520×1080px (21:9)",
} as const;

export type SectionType = keyof typeof ASPECT_RATIOS;

interface ImageUploaderProps {
  sectionType: SectionType;
  onUploadComplete: (data: {
    url: string;
    publicId: string;
    width: number;
    height: number;
  }) => void;
  onError?: (error: string) => void;
  label?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  existingImageUrl?: string;
}

export default function ImageUploader({
  sectionType,
  onUploadComplete,
  onError,
  label = "Upload Image",
  maxSizeMB = 50,
  disabled = false,
  existingImageUrl,
}: ImageUploaderProps) {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatio = ASPECT_RATIOS[sectionType];

  // Handle file selection
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file
      const error = validateImageFile(file, maxSizeMB);
      if (error) {
        onError?.(error);
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setSelectedFile(file);
        setIsModalOpen(true);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    },
    [maxSizeMB, onError]
  );

  // Handle crop complete
  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Handle upload (3-step process)
  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels || !selectedFile) {
      setUploadError("Missing image or crop data. Please select an image again.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(25); // Step 1: Starting
    setUploadError(null);

    try {
      // STEP 1: Pixel-perfect crop using canvas
      setUploadProgress(30);
      let croppedBlob;
      try {
        croppedBlob = await createCroppedImage(imageSrc, croppedAreaPixels);
      } catch (cropError: any) {
        throw new Error(`Crop failed: ${cropError.message}`);
      }

      if (!croppedBlob || croppedBlob.size === 0) {
        throw new Error("Cropped image is empty. Please try again.");
      }

      // STEP 2: High-quality compression with WebP
      setUploadProgress(50);
      let compressedFile: File;
      try {
        // Ensure compressedFile is a File object with proper metadata
        const compressed = await imageCompression(croppedBlob as File, {
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp",
          initialQuality: 0.9,
        });
        
        // Ensure it's a proper File object
        if (compressed instanceof File) {
          compressedFile = compressed;
        } else if (compressed && typeof compressed === 'object' && 'size' in compressed) {
          // It's a Blob-like object, convert to File
          compressedFile = new File([compressed as Blob], "image.webp", {
            type: "image/webp",
          });
        } else {
          throw new Error("Failed to create file from compressed image");
        }
      } catch (compressionError: any) {
        throw new Error(`Compression failed: ${compressionError.message}`);
      }

      if (!compressedFile || compressedFile.size === 0) {
        throw new Error("Compression failed. Please try again.");
      }

      setUploadProgress(60);

      // STEP 3: Validate Cloudinary environment variables before upload
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      // Console error checks for debugging
      if (!uploadPreset) {
        console.error(
          "❌ MISSING ENVIRONMENT VARIABLE: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
          "Please add this to your .env.local file: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset"
        );
        throw new Error("Upload preset is not configured. Please check your environment variables.");
      }

      if (!cloudName) {
        console.error(
          "❌ MISSING ENVIRONMENT VARIABLE: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
          "Please add this to your .env.local file: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name"
        );
        throw new Error("Cloudinary cloud name is not configured. Please check your environment variables.");
      }

      console.log("✅ Cloudinary Configuration Valid", {
        cloudName,
        uploadPreset,
        fileSize: `${(compressedFile.size / 1024).toFixed(2)}KB`,
        fileType: compressedFile.type,
      });

      // STEP 4: Upload to Cloudinary with strict FormData validation
      const formData = new FormData();
      
      // Append file strictly as File object
      formData.append("file", compressedFile, compressedFile.name);
      
      // Append upload_preset strictly as-is from env
      formData.append("upload_preset", uploadPreset);
      
      // Optional: add folder structure
      if (process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER) {
        formData.append(
          "folder",
          `${process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER}/${sectionType}`
        );
      }

      // Log FormData contents for debugging (file size, not actual blob)
      console.log("📤 FormData Payload", {
        fileSize: `${(compressedFile.size / 1024).toFixed(2)}KB`,
        fileType: compressedFile.type,
        fileName: compressedFile.name,
        uploadPreset: uploadPreset,
        folder: `${process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "shivay-studio"}/${sectionType}`,
      });

      setUploadProgress(70);

      let response;
      try {
        console.log(
          `🚀 Uploading to Cloudinary: https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
        );
        response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
      } catch (networkError: any) {
        console.error("❌ Network Error:", networkError);
        throw new Error(
          `Network error: Unable to reach Cloudinary. ${networkError.message}`
        );
      }

      setUploadProgress(90);

      // Parse response regardless of status for error message extraction
      let errorData: any = null;
      if (!response.ok) {
        try {
          errorData = await response.json();
          console.error("❌ Cloudinary Error Response:", errorData);
        } catch {
          errorData = { error: { message: `HTTP ${response.status}` } };
        }
      }

      if (!response.ok) {
        const errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          `Upload failed with HTTP ${response.status}`;
        console.error("📛 Upload Failed:", errorMessage);
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
        console.log("✅ Upload Response:", {
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
        });
      } catch (parseError: any) {
        console.error("❌ Response Parse Error:", parseError);
        throw new Error("Invalid response from Cloudinary. Response could not be parsed.");
      }

      if (!data.secure_url || !data.public_id) {
        console.error("❌ Incomplete Response from Cloudinary:", data);
        throw new Error(
          "Upload successful but Cloudinary response is incomplete. Missing URL or public ID."
        );
      }

      setUploadProgress(100);

      // Success callback
      onUploadComplete({
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
      });

      // Reset state
      setIsModalOpen(false);
      setImageSrc(null);
      setSelectedFile(null);
      setUploadProgress(0);
      setUploadError(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error.message || "Upload failed. Please try again.";
      setUploadError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Close modal
  const closeModal = () => {
    if (isUploading) return; // Prevent closing during upload
    setIsModalOpen(false);
    setImageSrc(null);
    setSelectedFile(null);
    setUploadError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Upload Button */}
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {existingImageUrl && (
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 group">
            <img
              src={existingImageUrl}
              alt="Current"
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="bg-white/90 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs font-medium text-gray-700">Current Image</p>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-full flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-500">Drag or click to select</p>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div>
            <p className="font-medium text-gray-700">Format</p>
            <p>{SECTION_LABELS[sectionType]}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Recommended Size</p>
            <p className="text-blue-600 font-medium">{RECOMMENDED_DIMENSIONS[sectionType]}</p>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {isModalOpen && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] h-[90vh] sm:h-auto flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Crop & Perfect Your Image
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Adjust zoom and position. The frame is locked to maintain the correct aspect ratio.
                </p>                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    {SECTION_LABELS[sectionType]}
                  </span>
                  <span className="text-xs text-gray-600">
                    📐 Recommended: <span className="font-semibold text-blue-600">{RECOMMENDED_DIMENSIONS[sectionType]}</span>
                  </span>
                </div>              </div>
              <button
                onClick={closeModal}
                disabled={isUploading}
                className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Scrollable body for small screens */}
            <div className="flex-1 overflow-y-auto">
              {/* Cropper Area */}
              <div className="relative min-h-[280px] sm:min-h-[400px] bg-slate-900 overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  objectFit="contain"
                  showGrid={true}
                  style={{
                    containerStyle: {
                      backgroundColor: "#0f172a",
                    },
                    cropAreaStyle: {
                      border: "3px solid #3b82f6",
                      boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
                    },
                  }}
                />
              </div>

              {/* Controls & Progress */}
              <div className="p-6 border-t bg-gradient-to-r from-gray-50 to-blue-50 space-y-4">
              {/* Zoom Control */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Zoom Level
                </label>
                <div className="flex items-center gap-4">
                  <ZoomOut className="w-5 h-5 text-blue-600" />
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 h-2.5 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full appearance-none cursor-pointer accent-blue-600"
                    disabled={isUploading}
                  />
                  <ZoomIn className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-bold text-blue-600 min-w-[2.5rem] text-center bg-white px-3 py-1 rounded-lg border border-blue-200">
                    {zoom.toFixed(1)}x
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="space-y-2 p-4 bg-red-50 rounded-xl border-2 border-red-300 flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Upload Failed</p>
                    <p className="text-sm text-red-700 mt-1">{uploadError}</p>
                    <p className="text-xs text-red-600 mt-2">
                      💡 Try: Reducing image size, checking internet connection, or using a different image format
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadError(null)}
                    className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-3 p-4 bg-white rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {uploadProgress < 40 && "🔄 Cropping image..."}
                        {uploadProgress >= 40 && uploadProgress < 70 && "✨ Compressing to WebP..."}
                        {uploadProgress >= 70 && uploadProgress < 100 && "☁️ Uploading to cloud..."}
                        {uploadProgress === 100 && "✅ Complete!"}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">{uploadProgress}% complete</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

                {/* Action Buttons */}
                <div className="flex gap-3 sticky bottom-0 bg-gradient-to-r from-gray-50 to-blue-50 pt-2 pb-1">
                  <button
                    onClick={closeModal}
                    disabled={isUploading}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading || uploadError !== null}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : uploadError ? (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        <span>Try Again</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Upload Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
