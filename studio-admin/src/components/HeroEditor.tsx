"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Copy } from "lucide-react";

interface HeroStyles {
  textColor: string;
  overlayOpacity: number;
  justifyContent: "flex-start" | "flex-center" | "flex-end";
  alignItems: "flex-start" | "flex-center" | "flex-end";
  verticalSpacing: number;
}

interface HeroEditorProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  location: string;
  onStylesChange: (styles: HeroStyles) => void;
  initialStyles?: HeroStyles;
}

const defaultStyles: HeroStyles = {
  textColor: "#ffffff",
  overlayOpacity: 0.5,
  justifyContent: "flex-center",
  alignItems: "flex-center",
  verticalSpacing: 0,
};

export default function HeroEditor({
  imageUrl,
  title,
  subtitle,
  location,
  onStylesChange,
  initialStyles = defaultStyles,
}: HeroEditorProps) {
  const [styles, setStyles] = useState<HeroStyles>(initialStyles);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    onStylesChange(styles);
  }, [styles]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStyles({ ...styles, textColor: e.target.value });
  };

  const handleColorCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validate hex color
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) || value === "") {
      setStyles({ ...styles, textColor: value });
    }
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStyles({ ...styles, overlayOpacity: parseFloat(e.target.value) });
  };

  const handleVerticalSpacingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStyles({ ...styles, verticalSpacing: parseInt(e.target.value) });
  };

  const handleAlignmentClick = (justify: typeof styles.justifyContent, align: typeof styles.alignItems) => {
    setStyles({ ...styles, justifyContent: justify, alignItems: align });
  };

  const presetColors = [
    { name: "White", value: "#ffffff" },
    { name: "Black", value: "#000000" },
    { name: "Gold", value: "#D4AF37" },
    { name: "Light Gray", value: "#E5E5E5" },
    { name: "Cream", value: "#FFF8DC" },
  ];

  const alignmentOptions = [
    { justify: "flex-start" as const, align: "flex-start" as const, label: "TL" },
    { justify: "flex-center" as const, align: "flex-start" as const, label: "TC" },
    { justify: "flex-end" as const, align: "flex-start" as const, label: "TR" },
    { justify: "flex-start" as const, align: "flex-center" as const, label: "ML" },
    { justify: "flex-center" as const, align: "flex-center" as const, label: "C" },
    { justify: "flex-end" as const, align: "flex-center" as const, label: "MR" },
    { justify: "flex-start" as const, align: "flex-end" as const, label: "BL" },
    { justify: "flex-center" as const, align: "flex-end" as const, label: "BC" },
    { justify: "flex-end" as const, align: "flex-end" as const, label: "BR" },
  ];

  const getFlexValue = (value: string) => {
    if (value === "flex-start") return "flex-start";
    if (value === "flex-center") return "center";
    if (value === "flex-end") return "flex-end";
    return value;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Controls */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Text Color</h3>
          
          {/* Color Picker and Code Input Row */}
          <div className="flex gap-3 items-end mb-4">
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={styles.textColor}
                onChange={handleColorChange}
                className="h-12 w-20 rounded cursor-pointer border-2 border-gray-300 hover:border-blue-400 transition"
              />
              <span className="text-sm font-mono text-gray-600 min-w-fit">{styles.textColor}</span>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={styles.textColor}
                onChange={handleColorCodeInput}
                placeholder="#ffffff"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:border-blue-500 focus:outline-none"
                maxLength={7}
              />
            </div>
          </div>

          {/* Preset Quick Colors */}
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setStyles({ ...styles, textColor: color.value })}
                className={`p-2 rounded border-2 transition-all hover:scale-110 group relative ${
                  styles.textColor === color.value
                    ? "border-blue-500 scale-105 ring-2 ring-blue-300"
                    : "border-gray-300 hover:border-blue-400"
                }`}
                title={color.name}
              >
                <div
                  className="w-full h-6 rounded"
                  style={{ backgroundColor: color.value }}
                />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Overlay Opacity */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Overlay Opacity</h3>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.05"
              value={styles.overlayOpacity}
              onChange={handleOpacityChange}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>0%</span>
              <span className="font-semibold">{Math.round(styles.overlayOpacity * 100)}%</span>
              <span>90%</span>
            </div>
            <div
              className="h-12 rounded bg-black transition-opacity"
              style={{ opacity: styles.overlayOpacity }}
            />
          </div>
        </div>

        {/* Text Alignment Grid (9-Point) */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Text Position (9-Point Grid)</h3>
          <div className="grid grid-cols-3 gap-2">
            {alignmentOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAlignmentClick(option.justify, option.align)}
                className={`p-3 rounded border-2 font-bold transition-all ${
                  styles.justifyContent === option.justify && styles.alignItems === option.align
                    ? "bg-blue-500 text-white border-blue-600 scale-105"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            TL=Top-Left, TC=Top-Center, TR=Top-Right, ML=Middle-Left, C=Center, MR=Middle-Right, BL=Bottom-Left, BC=Bottom-Center, BR=Bottom-Right
          </p>
        </div>

        {/* Vertical Spacing */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Vertical Spacing</h3>
          <div className="space-y-2">
            <input
              type="range"
              min="-100"
              max="100"
              step="10"
              value={styles.verticalSpacing}
              onChange={handleVerticalSpacingChange}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>-100px</span>
              <span className="font-semibold">{styles.verticalSpacing > 0 ? "+" : ""}{styles.verticalSpacing}px</span>
              <span>+100px</span>
            </div>
          </div>
        </div>

        {/* Configuration Display */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Configuration</h3>
          <div className="bg-gray-100 p-3 rounded border border-gray-300 text-xs font-mono overflow-auto max-h-48">
            <pre>{JSON.stringify(styles, null, 2)}</pre>
          </div>
        </div>
      </div>

      {/* Right Side - Live Preview */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Live Preview</h3>
        <div
          className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg border-2 border-gray-300"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black transition-opacity"
            style={{ opacity: styles.overlayOpacity }}
          />

          {/* Content Container */}
          <div
            className="absolute inset-0 flex transition-all duration-300"
            style={{
              justifyContent: getFlexValue(styles.justifyContent),
              alignItems: getFlexValue(styles.alignItems),
              paddingTop: `${styles.verticalSpacing}px`,
            }}
          >
            {/* Text Content */}
            <div className="text-center px-6 z-10 max-w-lg">
              {/* Location Tag */}
              <div className="mb-3">
                <span
                  className="text-xs md:text-sm tracking-widest uppercase font-semibold"
                  style={{ color: styles.textColor }}
                >
                  {location}
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 drop-shadow-lg"
                style={{ color: styles.textColor }}
              >
                {title}
              </h1>

              {/* Subtitle */}
              <p
                className="text-lg md:text-2xl italic drop-shadow-md"
                style={{ color: styles.textColor }}
              >
                {subtitle}
              </p>
            </div>
          </div>

          {/* Grid Overlay (for reference) */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0 border border-white">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white" />
              ))}
            </div>
          </div>
        </div>

        {/* Preview Info */}
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>✓ Real-time preview shows exactly how it will appear on the website</p>
          <p>✓ Adjust text color and overlay opacity for better readability</p>
          <p>✓ Use the 9-point grid to position text according to your image</p>
        </div>
      </div>
    </div>
  );
}
