"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { apiService } from "@/services/api";

interface WeddingGalleryImage {
  _id: string;
  imageUrl: string;
  photoType: "wedding" | "prewedding";
  order: number;
}

interface GalleryCardProps {
  image: WeddingGalleryImage;
  index: number;
  width: number;
}

const GalleryCard = ({ image, index, width }: GalleryCardProps) => {
  return (
    <div
      className="relative flex-shrink-0 h-full overflow-hidden rounded-lg shadow-xl group cursor-pointer"
      style={{ width: `${width}px` }}
    >
      <img
        src={image.imageUrl}
        alt={image.photoType === "wedding" ? "Wedding" : "Pre-Wedding"}
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
        loading={index < 6 ? "eager" : "lazy"}
      />
      
      {/* Film Grain Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><filter id=%22noise%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 /></filter><rect width=%22100%22 height=%22100%22 filter=%22url(%23noise)%22 opacity=%220.02%22/></svg>')] pointer-events-none" />
    </div>
  );
};

const DualMarqueeGallerySection = () => {
  const [images, setImages] = useState<WeddingGalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const topRowRef = useRef<HTMLDivElement>(null);
  const bottomRowRef = useRef<HTMLDivElement>(null);
  const topAnimationRef = useRef<gsap.core.Tween | null>(null);
  const bottomAnimationRef = useRef<gsap.core.Tween | null>(null);

  // Fetch wedding gallery images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        console.log('Fetching wedding gallery images...');
        const galleryImages = await apiService.getWeddingGallery();
        console.log('Fetched images count:', galleryImages?.length);
        console.log('Fetched images:', galleryImages);
        
        if (galleryImages && Array.isArray(galleryImages) && galleryImages.length > 0) {
          // Sort by order field to ensure correct display
          const sortedImages = galleryImages.sort((a, b) => (a.order || 0) - (b.order || 0));
          console.log('Setting images:', sortedImages.length, 'images');
          setImages(sortedImages);
        } else {
          console.log('No images found - galleryImages:', galleryImages);
        }
      } catch (error) {
        console.error("Failed to fetch wedding gallery:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Generate widths for images (varied for visual interest)
  const getImageWidth = (index: number) => {
    const widths = [400, 500, 450, 380, 420, 480];
    return widths[index % widths.length];
  };

  // Create image arrays with widths
  const imagesWithWidths = images.map((img, idx) => ({
    ...img,
    width: getImageWidth(idx),
  }));

  // Duplicate for seamless loop (only after images are loaded)
  const topRowImages = images.length > 0 
    ? [...imagesWithWidths, ...imagesWithWidths, ...imagesWithWidths]
    : [];
  const bottomRowImages = images.length > 0
    ? [...imagesWithWidths.slice().reverse(), ...imagesWithWidths.slice().reverse(), ...imagesWithWidths.slice().reverse()]
    : [];

  useEffect(() => {
    if (!topRowRef.current || !bottomRowRef.current || images.length === 0) {
      console.log('Animation setup skipped - refs or images missing', {
        topRef: !!topRowRef.current,
        bottomRef: !!bottomRowRef.current,
        imagesLength: images.length
      });
      return;
    }

    console.log('Setting up GSAP animations for', images.length, 'images');

    // Calculate distance to move for seamless loop
    const topRowWidth = topRowRef.current.scrollWidth / 3; // Divide by 3 because we duplicated 3 times
    const bottomRowWidth = bottomRowRef.current.scrollWidth / 3;

    console.log('Top row width:', topRowWidth, 'Bottom row width:', bottomRowWidth);

    // Top row: Move RIGHT to LEFT (negative X)
    topAnimationRef.current = gsap.to(topRowRef.current, {
      x: -topRowWidth,
      duration: 60, // Slow, luxury speed (60 seconds)
      ease: "linear",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => parseFloat(x) % topRowWidth),
      },
    });

    // Bottom row: Move LEFT to RIGHT (positive X, starting from negative)
    gsap.set(bottomRowRef.current, { x: -bottomRowWidth });
    bottomAnimationRef.current = gsap.to(bottomRowRef.current, {
      x: 0,
      duration: 60,
      ease: "linear",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => (parseFloat(x) % bottomRowWidth) - bottomRowWidth),
      },
    });

    // Cleanup
    return () => {
      topAnimationRef.current?.kill();
      bottomAnimationRef.current?.kill();
    };
  }, [images]);

  // Pause on hover
  const handleMouseEnter = (row: "top" | "bottom") => {
    if (row === "top" && topAnimationRef.current) {
      topAnimationRef.current.pause();
    } else if (row === "bottom" && bottomAnimationRef.current) {
      bottomAnimationRef.current.pause();
    }
  };

  const handleMouseLeave = (row: "top" | "bottom") => {
    if (row === "top" && topAnimationRef.current) {
      topAnimationRef.current.resume();
    } else if (row === "bottom" && bottomAnimationRef.current) {
      bottomAnimationRef.current.resume();
    }
  };

  return (
    <section className="relative w-full bg-[#0a0a0a] py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin">
              <div className="h-12 w-12 border-4 border-gray-700 border-t-white rounded-full"></div>
            </div>
            <p className="mt-4 text-gray-400">Loading gallery...</p>
          </div>
        </div>
      ) : images.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500 text-lg">Gallery images coming soon</p>
        </div>
      ) : (
        <div className="relative space-y-8 md:space-y-12">
          {/* Top Row - Scrolls LEFT */}
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => handleMouseEnter("top")}
            onMouseLeave={() => handleMouseLeave("top")}
            onTouchStart={() => handleMouseEnter("top")}
            onTouchEnd={() => handleMouseLeave("top")}
          >
            <div
              ref={topRowRef}
              className="flex gap-3 md:gap-4 h-[240px] md:h-[280px] lg:h-[320px]"
              style={{ width: "fit-content" }}
            >
              {topRowImages.map((image, index) => (
                <GalleryCard key={`top-${image._id}-${index}`} image={image} index={index} width={image.width} />
              ))}
            </div>
          </div>

          {/* Bottom Row - Scrolls RIGHT */}
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => handleMouseEnter("bottom")}
            onMouseLeave={() => handleMouseLeave("bottom")}
            onTouchStart={() => handleMouseEnter("bottom")}
            onTouchEnd={() => handleMouseLeave("bottom")}
          >
            <div
              ref={bottomRowRef}
              className="flex gap-3 md:gap-4 h-[240px] md:h-[280px] lg:h-[320px]"
              style={{ width: "fit-content" }}
            >
              {bottomRowImages.map((image, index) => (
                <GalleryCard key={`bottom-${image._id}-${index}`} image={image} index={index} width={image.width} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Optional: Subtle vignette effect on edges */}
      <div className="absolute inset-y-0 left-0 w-32 md:w-48 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-32 md:w-48 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none"></div>
    </section>
  );
};

export default DualMarqueeGallerySection;
