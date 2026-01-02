"use client";

import { useRef, useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import { apiService, Film } from "@/services/api";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface VideoCardProps {
  video: Film;
  index: number;
  onOpenFullscreen: (video: Film) => void;
}

const VideoCard = ({ video, index, onOpenFullscreen }: VideoCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;

    // Scroll reveal animation with GSAP
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        scale: 0.9,
        y: 50,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 90%",
          end: "top 50%",
          scrub: 0.5,
          markers: false,
        },
      }
    );

    // Intersection Observer for video autoplay
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.play().catch(() => {
              // Autoplay might be blocked, that's okay
            });
            setIsPlaying(true);
          } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative group cursor-pointer overflow-hidden rounded-xl shadow-2xl"
      onClick={() => onOpenFullscreen(video)}
    >
      {/* Video Container */}
      <div className="relative aspect-video overflow-hidden bg-black">
        {video.videoUrl ? (
          <video
            ref={videoRef}
            src={video.videoUrl}
            poster={video.thumbnail}
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Film Grain Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><filter id=%22noise%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 /></filter><rect width=%22100%22 height=%22100%22 filter=%22url(%23noise)%22 opacity=%220.02%22/></svg>')] pointer-events-none" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Play Icon (Shows on hover or when not playing) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#D4AF37]/20 backdrop-blur-sm border border-[#D4AF37]/50 flex items-center justify-center group-hover:bg-[#D4AF37]/30 transition-colors">
              <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" fill="white" />
            </div>
          </div>
        )}

        {/* Film Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
          <span className="text-[10px] md:text-xs tracking-[0.3em] text-[#D4AF37] uppercase font-light block mb-2">
            {video.category || "WEDDING FILM"}
          </span>
          <h3 className="font-display text-xl md:text-2xl text-white font-light italic">
            {video.title}
          </h3>
        </div>
      </div>
    </div>
  );
};

const FilmsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [films, setFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const data = await apiService.getFilms();
        setFilms(data);
      } catch (error) {
        console.error("Failed to fetch films:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFilms();
  }, []);

  const handleOpenFullscreen = (film: Film) => {
    setSelectedFilm(film);
  };

  const handleCloseFullscreen = () => {
    setSelectedFilm(null);
  };

  return (
    <>
      <section
        ref={sectionRef}
        className="relative py-16 md:py-24 lg:py-32 bg-[#0a0a0a] overflow-hidden"
      >
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <span className="text-[10px] md:text-xs tracking-[0.5em] text-[#D4AF37] uppercase font-light block mb-4">
              Cinematography
            </span>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-white font-light tracking-tight mb-4">
              Wedding Films
            </h2>
            <p className="text-sm md:text-base text-white/60 max-w-2xl mx-auto font-light tracking-wide">
              Cinematic stories that bring your moments to life
            </p>
          </div>

          {/* Films Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
              {films.map((film, index) => (
                <VideoCard
                  key={film._id}
                  video={film}
                  index={index}
                  onOpenFullscreen={handleOpenFullscreen}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Fullscreen Modal */}
      {selectedFilm && (
        <div
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 md:p-8 backdrop-blur-sm"
          onClick={handleCloseFullscreen}
        >
          <button
            className="absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            onClick={handleCloseFullscreen}
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>

          <div
            className="w-full max-w-5xl aspect-video relative"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedFilm.videoUrl ? (
              <video
                src={selectedFilm.videoUrl}
                controls
                autoPlay
                className="w-full h-full rounded-lg shadow-2xl"
              />
            ) : (
              <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                <p className="text-white/60">Video not available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FilmsSection;