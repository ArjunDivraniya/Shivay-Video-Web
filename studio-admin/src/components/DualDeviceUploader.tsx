"use client";

import { useState, useMemo } from "react";
import { Monitor, Smartphone, Image as ImageIcon } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

interface DualDeviceUploaderProps {
  desktopInitial?: { url: string | null; publicId?: string | null };
  mobileInitial?: { url: string | null; publicId?: string | null };
  disabled?: boolean;
  onComplete: (payload: {
    desktopUrl: string | null;
    desktopPublicId: string | null;
    mobileUrl: string | null;
    mobilePublicId: string | null;
  }) => void;
}

const DESKTOP_ASPECT = 16 / 9;
const MOBILE_ASPECT = 3 / 4; // choose portrait-friendly crop; change to 9/16 if preferred

export default function DualDeviceUploader({
  desktopInitial = { url: null, publicId: null },
  mobileInitial = { url: null, publicId: null },
  disabled = false,
  onComplete,
}: DualDeviceUploaderProps) {
  const [activeTab, setActiveTab] = useState<"desktop" | "mobile">("desktop");
  const [desktopUrl, setDesktopUrl] = useState<string | null>(desktopInitial.url ?? null);
  const [desktopPublicId, setDesktopPublicId] = useState<string | null>(desktopInitial.publicId ?? null);
  const [mobileUrl, setMobileUrl] = useState<string | null>(mobileInitial.url ?? null);
  const [mobilePublicId, setMobilePublicId] = useState<string | null>(mobileInitial.publicId ?? null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const previewImg = useMemo(() => {
    if (previewDevice === "mobile" && mobileUrl) return mobileUrl;
    return desktopUrl || mobileUrl || "";
  }, [previewDevice, desktopUrl, mobileUrl]);

  const emit = (next: {
    desktopUrl: string | null;
    desktopPublicId: string | null;
    mobileUrl: string | null;
    mobilePublicId: string | null;
  }) => {
    onComplete(next);
  };

  const handleDesktopComplete = (data: { url: string; publicId: string }) => {
    const next = {
      desktopUrl: data.url,
      desktopPublicId: data.publicId,
      mobileUrl,
      mobilePublicId,
    };
    setDesktopUrl(data.url);
    setDesktopPublicId(data.publicId);
    emit(next);
  };

  const handleMobileComplete = (data: { url: string; publicId: string }) => {
    const next = {
      desktopUrl,
      desktopPublicId,
      mobileUrl: data.url,
      mobilePublicId: data.publicId,
    };
    setMobileUrl(data.url);
    setMobilePublicId(data.publicId);
    emit(next);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setActiveTab("desktop")}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition ${
            activeTab === "desktop"
              ? "bg-white shadow text-blue-700"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Monitor className="w-4 h-4" /> Desktop 16:9
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("mobile")}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition ${
            activeTab === "mobile"
              ? "bg-white shadow text-blue-700"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Smartphone className="w-4 h-4" /> Mobile 3:4
        </button>
      </div>

      {/* Uploaders */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        {activeTab === "desktop" ? (
          <ImageUploader
            sectionType="hero"
            label="Upload Desktop Image (16:9)"
            existingImageUrl={desktopUrl || undefined}
            onUploadComplete={handleDesktopComplete}
            disabled={disabled}
            aspectRatioOverride={DESKTOP_ASPECT}
            sectionLabelOverride="Hero Desktop"
            recommendedDimensionsOverride="1920×1080px (16:9)"
          />
        ) : (
          <ImageUploader
            sectionType="hero"
            label="Upload Mobile Image (3:4)"
            existingImageUrl={mobileUrl || undefined}
            onUploadComplete={handleMobileComplete}
            disabled={disabled}
            aspectRatioOverride={MOBILE_ASPECT}
            sectionLabelOverride="Hero Mobile"
            recommendedDimensionsOverride="1440×1920px (3:4)"
          />
        )}
      </div>

      {/* Device Preview Toggle */}
      <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <ImageIcon className="w-4 h-4" /> Live device preview
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPreviewDevice("desktop")}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition ${
              previewDevice === "desktop"
                ? "bg-blue-600 text-white"
                : "bg-white border text-gray-700 hover:border-blue-400"
            }`}
          >
            <Monitor className="w-4 h-4" /> Desktop
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice("mobile")}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition ${
              previewDevice === "mobile"
                ? "bg-blue-600 text-white"
                : "bg-white border text-gray-700 hover:border-blue-400"
            }`}
          >
            <Smartphone className="w-4 h-4" /> Mobile
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-white border rounded-xl shadow-sm p-4">
        <div
          className={`${previewDevice === "mobile" ? "aspect-[3/4] max-w-sm" : "aspect-video"} w-full relative overflow-hidden rounded-lg bg-gray-200`}
        >
          <picture>
            {previewDevice === "mobile" && mobileUrl && (
              <source media="(max-width: 768px)" srcSet={mobileUrl} />
            )}
            {previewImg ? (
              <img
                src={previewImg}
                alt="Hero preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                Upload an image to preview
              </div>
            )}
          </picture>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Uses the <code>&lt;picture&gt;</code> tag so mobile users download the smaller portrait image when available.
        </p>
      </div>
    </div>
  );
}
