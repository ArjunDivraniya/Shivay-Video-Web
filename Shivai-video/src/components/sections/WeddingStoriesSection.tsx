"use client";

import { useRef, useEffect, useState } from "react";
import { apiService, WeddingStory } from "@/services/api";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import weddingCeremony from "@/assets/wedding-ceremony.jpg";
import "@/styles/wedding-stories.css";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

interface StoryCardProps {
  story: WeddingStory;
  index: number;
}

const StoryCard = ({ story, index }: StoryCardProps) => {
  return (
    <div className="relative flex-shrink-0 w-[75vw] md:w-[60vw] lg:w-[50vw] h-[70vh] md:h-[75vh] select-none">
      <div className="relative h-full overflow-hidden group rounded-2xl shadow-2xl">
        {/* Cover Image */}
        <img
          src={story.image || weddingCeremony}
          alt={story.couple}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          loading={index < 2 ? "eager" : "lazy"}
        />

        {/* Film Grain Texture Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><filter id=%22noise%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 /></filter><rect width=%22100%22 height=%22100%22 filter=%22url(%23noise)%22 opacity=%220.03%22/></svg>')] pointer-events-none" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />

        {/* Content Box */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
          {/* Story Number & Type */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-[2px] bg-gradient-to-r from-[#D4AF37] to-transparent"></div>
            <span className="text-[11px] tracking-[0.3em] text-[#D4AF37] uppercase font-light">
              {String(index + 1).padStart(2, "0")} — {story.event || "WEDDING"}
            </span>
          </div>

          {/* Couple Name - Serif Font */}
          <h3 className="font-display text-4xl md:text-6xl text-white mb-3 italic font-light tracking-tight">
            {story.couple}
          </h3>

          {/* Location */}
          <p className="font-body text-xs md:text-sm text-white/70 uppercase tracking-[0.2em] font-light">
            📍 {story.location}
          </p>
        </div>
      </div>
    </div>
  );
};

const WeddingStoriesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const [stories, setStories] = useState<WeddingStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await apiService.getWeddingStories();
        setStories(data);
      } catch (err) {
        console.error("Failed to fetch wedding stories:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, []);

  // GSAP ScrollTrigger Animation
  useEffect(() => {
    if (!stories.length || isLoading || !horizontalTrackRef.current) return;

    // Calculate total horizontal distance
    const trackWidth = horizontalTrackRef.current.scrollWidth;
    const windowWidth = window.innerWidth;
    const horizontalDistance = trackWidth - windowWidth;

    // Adjust scroll multiplier based on screen size
    const scrollMultiplier = window.innerWidth < 768 ? 3 : 2;

    // Create ScrollTrigger animation
    gsap.to(horizontalTrackRef.current, {
      x: -horizontalDistance,
      ease: "linear",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${horizontalDistance * scrollMultiplier}`, // Slower on mobile
        scrub: 1, // Smooth scrubbing with 1s delay
        pin: true, // Pin the section
        markers: false, // Set to true for debugging
        onUpdate: (self) => {
          // Optional: Add parallax or other effects here
        },
      },
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [stories, isLoading]);

  if (!isLoading && stories.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#080808] z-10"
    >
      {/* Pinned Container */}
      <div className="relative w-full h-screen overflow-hidden bg-[#080808]">
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] z-0">
          <h2 className="text-[15vw] md:text-[20vw] font-bold text-white whitespace-nowrap">
            SHIVAY PHOTOGRAPHY
          </h2>
        </div>

        {/* Top Header UI */}
        <div className="absolute top-8 md:top-12 left-6 md:left-20 flex flex-col gap-3 z-50 pointer-events-none">
          <span className="text-[9px] md:text-[10px] tracking-[0.5em] text-[#D4AF37] uppercase font-light">
            Portfolio
          </span>
          <h2 className="font-display text-3xl md:text-6xl lg:text-7xl text-white tracking-tight">
            Wedding <br className="hidden md:block" /> Stories
          </h2>
          <p className="text-xs md:text-sm text-white/50 tracking-widest mt-2">
            Scroll to explore our stories
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="absolute top-8 md:top-12 right-6 md:right-20 flex gap-3 z-50">
          {stories.map((_, i) => (
            <div
              key={i}
              className="w-8 md:w-12 h-[1px] bg-white/10 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#D4AF37]/50 rounded-full"
                style={{
                  width: "0%",
                  transition: "width 0.3s ease",
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Horizontal Scrollable Track */}
        <div className="w-full h-full flex items-center overflow-x-hidden pt-32 md:pt-0">
          <div
            ref={horizontalTrackRef}
            className="flex gap-6 md:gap-12 px-6 md:px-20 lg:px-32 py-0"
          >
            {isLoading ? (
              <div className="w-screen h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[#D4AF37] tracking-widest text-sm">
                    LOADING STORIES...
                  </p>
                </div>
              </div>
            ) : (
              stories.map((story, index) => (
                <StoryCard key={story._id} story={story} index={index} />
              ))
            )}
          </div>
        </div>

        {/* Bottom Story Counter */}
        <div className="absolute bottom-8 md:bottom-12 left-6 md:left-20 z-50">
          <p className="text-xs md:text-sm text-white/50 tracking-widest">
            <span className="text-[#D4AF37] font-semibold">1</span> / {stories.length}
          </p>
        </div>

        {/* Mobile Scroll Indicator */}
        {isMobile && (
          <div className="absolute bottom-8 right-6 z-50 animate-bounce">
            <svg
              className="w-5 h-5 text-[#D4AF37]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
};

export default WeddingStoriesSection;