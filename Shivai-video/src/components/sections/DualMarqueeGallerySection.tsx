"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Sample gallery images - Replace with your actual images from API
const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    alt: "Wedding",
    category: "Wedding",
    width: 400,
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800",
    alt: "Pre-Wedding",
    category: "Pre-Wedding",
    width: 500,
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800",
    alt: "Traditional",
    category: "Traditional",
    width: 450,
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800",
    alt: "Corporate",
    category: "Corporate",
    width: 380,
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
    alt: "Party",
    category: "Party",
    width: 420,
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800",
    alt: "Destination",
    category: "Destination",
    width: 480,
  },
];

// Duplicate for seamless loop
const topRowImages = [...galleryImages, ...galleryImages, ...galleryImages];
const bottomRowImages = [...galleryImages.slice().reverse(), ...galleryImages.slice().reverse(), ...galleryImages.slice().reverse()];

interface GalleryCardProps {
  image: typeof galleryImages[0];
  index: number;
}

const GalleryCard = ({ image, index }: GalleryCardProps) => {
  return (
    <div
      className="relative flex-shrink-0 h-full overflow-hidden rounded-lg shadow-xl group cursor-pointer"
      style={{ width: `${image.width}px` }}
    >
      <img
        src={image.src}
        alt={image.alt}
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
        loading={index < 6 ? "eager" : "lazy"}
      />
      
      {/* Film Grain Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><filter id=%22noise%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 /></filter><rect width=%22100%22 height=%22100%22 filter=%22url(%23noise)%22 opacity=%220.02%22/></svg>')] pointer-events-none" />
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white text-sm md:text-base font-light tracking-widest uppercase">
            {image.category}
          </p>
        </div>
      </div>
    </div>
  );
};

const DualMarqueeGallerySection = () => {
  const topRowRef = useRef<HTMLDivElement>(null);
  const bottomRowRef = useRef<HTMLDivElement>(null);
  const topAnimationRef = useRef<gsap.core.Tween | null>(null);
  const bottomAnimationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!topRowRef.current || !bottomRowRef.current) return;

    // Calculate distance to move for seamless loop
    const topRowWidth = topRowRef.current.scrollWidth / 3; // Divide by 3 because we duplicated 3 times
    const bottomRowWidth = bottomRowRef.current.scrollWidth / 3;

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
  }, []);

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
              <GalleryCard key={`top-${image.id}-${index}`} image={image} index={index} />
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
              <GalleryCard key={`bottom-${image.id}-${index}`} image={image} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Optional: Subtle vignette effect on edges */}
      <div className="absolute inset-y-0 left-0 w-32 md:w-48 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-32 md:w-48 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none"></div>
    </section>
  );
};

export default DualMarqueeGallerySection;
