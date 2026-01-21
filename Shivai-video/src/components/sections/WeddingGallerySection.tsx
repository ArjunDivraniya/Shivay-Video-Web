"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface WeddingGalleryImage {
  _id: string;
  imageUrl: string;
  photoType: "wedding" | "prewedding";
  order: number;
}

const WeddingGallerySection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<WeddingGalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // Fetch wedding gallery images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/wedding-gallery");
        const result = await response.json();
        if (result.success) {
          setImages(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch wedding gallery:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Handle scroll lock on hover
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isHovering) {
        e.preventDefault();
      }
    };

    if (isHovering) {
      document.addEventListener("wheel", handleWheel, { passive: false });
      return () => document.removeEventListener("wheel", handleWheel);
    }
  }, [isHovering]);

  // Calculate dynamic grid columns based on image count
  const getGridCols = () => {
    const count = images.length;
    if (count <= 6) return "grid-cols-2 md:grid-cols-2 lg:grid-cols-3";
    if (count <= 12) return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
  };

  return (
    <section
      ref={containerRef}
      className="w-full py-16 md:py-24 bg-gradient-to-b from-white to-gray-50"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 font-serif">
            Wedding Gallery
          </h2>
          <p className="text-lg text-gray-600">
            Capture the essence of love through our lens
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin">
                <div className="h-12 w-12 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
              </div>
              <p className="mt-4 text-gray-600">Loading gallery...</p>
            </div>
          </div>
        ) : images.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500 text-lg">Gallery images coming soon</p>
          </div>
        ) : (
          <>
            {/* Masonry Grid - Stop scroll on hover */}
            <div
              ref={gridRef}
              className={`grid ${getGridCols()} gap-4 md:gap-6 auto-rows-max`}
              style={{
                overflow: isHovering ? "hidden" : "visible",
              }}
            >
              {images.map((image, index) => {
                // Calculate random heights for masonry effect (between 200px and 400px)
                const heights = [
                  "md:row-span-2",
                  "md:row-span-3",
                  "md:row-span-1",
                  "md:row-span-2",
                ];
                const heightClass = heights[index % heights.length];

                return (
                  <div
                    key={image._id}
                    className={`relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ${heightClass}`}
                  >
                    {/* Image */}
                    <img
                      src={image.imageUrl}
                      alt={`Wedding ${image.photoType}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="mt-12 md:mt-16 flex justify-center gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {images.filter((img) => img.photoType === "wedding").length}
                </p>
                <p className="text-gray-600 text-sm mt-1">Wedding Photos</p>
              </div>
              <div className="w-px bg-gray-300"></div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {images.filter((img) => img.photoType === "prewedding").length}
                </p>
                <p className="text-gray-600 text-sm mt-1">Prewedding Photos</p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default WeddingGallerySection;
