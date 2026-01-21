"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { apiService, Film } from "@/services/api";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AUTOPLAY_DURATION = 16000; // 16 seconds per film
const TRANSITION_DURATION = 900; // 0.9s cross-dissolve

const FilmsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const oldVideoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const tvScreenRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimationRef = useRef<gsap.core.Tween | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [films, setFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Fetch films
  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const data = await apiService.getFilms();
        // Limit to 5 films max
        setFilms(data.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch films:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFilms();
  }, []);

  // Reset progress bar animation
  const resetProgressBar = useCallback(() => {
    if (progressAnimationRef.current) {
      progressAnimationRef.current.kill();
    }
    if (progressBarRef.current) {
      gsap.set(progressBarRef.current, { scaleX: 0 });
      progressAnimationRef.current = gsap.to(progressBarRef.current, {
        scaleX: 1,
        duration: AUTOPLAY_DURATION / 1000,
        ease: "none",
      });
    }
  }, []);

  // Auto-advance to next film
  const goToNext = useCallback(() => {
    if (films.length === 0 || isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % films.length);
    
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  }, [films.length, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (films.length === 0 || isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + films.length) % films.length);
    
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  }, [films.length, isTransitioning]);

  // Handle user interaction - reset autoplay timer
  const handleUserInteraction = useCallback(() => {
    setUserInteracted(true);
    
    // Clear existing timers
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (progressAnimationRef.current) {
      progressAnimationRef.current.kill();
    }
    
    // The autoplay timer will be reset by the useEffect watching currentIndex
    // This ensures that after manual navigation, autoplay resumes with full duration
  }, []);

  // TV screen glow pulse effect
  const triggerScreenPulse = useCallback(() => {
    if (tvScreenRef.current && !prefersReducedMotion) {
      gsap.fromTo(
        tvScreenRef.current,
        { filter: 'brightness(1)' },
        { 
          filter: 'brightness(1.15)', 
          duration: 0.3,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1
        }
      );
    }
  }, [prefersReducedMotion]);

  // Setup auto-play timer
  useEffect(() => {
    if (!isVisible || films.length === 0 || prefersReducedMotion || isPaused) return;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Reset and start progress bar
    resetProgressBar();

    // Set new timer
    timerRef.current = setTimeout(goToNext, AUTOPLAY_DURATION);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (progressAnimationRef.current) {
        progressAnimationRef.current.kill();
      }
    };
  }, [currentIndex, isVisible, films.length, goToNext, resetProgressBar, prefersReducedMotion, isPaused]);

  // Handle video playback based on visibility
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (isVisible && !isTransitioning && !isPaused) {
      // Force muted to ensure autoplay works
      video.muted = true;
      video.volume = 0;
      
      // Load the video first
      video.load();
      
      // Try to play after a short delay
      const playTimeout = setTimeout(() => {
        if (videoRef.current) {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log('Video playing successfully');
            }).catch((error) => {
              console.log('Autoplay prevented:', error);
              // Retry with user interaction on click
              const retryPlay = () => {
                if (videoRef.current) {
                  videoRef.current.muted = true;
                  videoRef.current.volume = 0;
                  videoRef.current.play().catch(() => {});
                  document.removeEventListener('click', retryPlay);
                }
              };
              document.addEventListener('click', retryPlay, { once: true });
            });
          }
        }
      }, 100);
      
      triggerScreenPulse();
      
      return () => clearTimeout(playTimeout);
    } else {
      video.pause();
    }
  }, [isVisible, currentIndex, isTransitioning, isPaused, triggerScreenPulse]);

  // Ensure new video starts playing after index change (e.g., Next/Prev)
  useEffect(() => {
    if (!videoRef.current || isPaused) return;

    const el = videoRef.current;
    const tryPlay = () => {
      // Always ensure muted for autoplay
      el.muted = true;
      el.volume = 0;
      el.load();
      
      // Wait a bit for video to load
      setTimeout(() => {
        const playPromise = el.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Video transition play successful');
          }).catch((error) => {
            console.log('Video play prevented:', error);
            // Try again on next user interaction
            const handler = () => {
              el.muted = true;
              el.volume = 0;
              el.play().catch(() => {});
              document.removeEventListener('click', handler);
            };
            document.addEventListener('click', handler, { once: true });
          });
        }
      }, 150);
    };

    if (isVisible && !isTransitioning) {
      tryPlay();
    }
  }, [currentIndex, isVisible, isTransitioning, isPaused]);

  // Intersection Observer for section visibility
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
        handleUserInteraction();
      } else if (e.key === 'ArrowRight') {
        goToNext();
        handleUserInteraction();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        setUserInteracted(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, handleUserInteraction]);

  // Preload next video
  useEffect(() => {
    if (films.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % films.length;
    const nextFilm = films[nextIndex];
    
    if (nextFilm?.videoUrl) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'video';
      link.href = nextFilm.videoUrl;
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [currentIndex, films]);

  const hasFilms = films.length > 0;
  const currentFilm = hasFilms ? films[currentIndex] : null;

  if (isLoading) {
    return (
      <section className="relative min-h-screen bg-gradient-to-b from-[#f5f5f0] to-[#e8e8e0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm tracking-widest font-light">LOADING STUDIO</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-gradient-to-b from-[#f5f5f0] via-[#ececde] to-[#e5e5d8] overflow-hidden flex items-center justify-center py-16 md:py-20"
      role="region"
      aria-label="Wedding Films TV Showcase"
    >
      {/* Subtle Texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><filter id=%22noise%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 /></filter><rect width=%22100%22 height=%22100%22 filter=%22url(%23noise)%22/></svg>')]" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <span className="text-[10px] md:text-xs tracking-[0.5em] text-[#D4AF37] uppercase font-light block mb-3">
            Studio Display
          </span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-gray-900 font-light tracking-tight mb-3">
            Wedding Films
          </h2>
          <p className="text-xs md:text-sm text-gray-600 font-light tracking-wide">
            Continuously playing our finest work
          </p>
        </div>

        {/* TV Display Container */}
        <div className="max-w-5xl mx-auto">
          <div 
            className="relative"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            onTouchStart={() => {
              setShowControls(true);
              setIsPaused(true);
            }}
            onTouchEnd={() => {
              setTimeout(() => setShowControls(false), 3000);
              setTimeout(() => setIsPaused(false), 1000);
            }}
          >
            {/* Ambient Glow Behind TV */}
            <div className="absolute -inset-4 md:-inset-6 blur-3xl opacity-30 pointer-events-none transition-opacity duration-1000">
              <div className="absolute inset-0 bg-gradient-radial from-[#D4AF37]/20 via-transparent to-transparent" />
            </div>

            {/* TV Frame */}
            <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-3xl p-4 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
              {/* Subtle Reflection Below TV */}
              <div className="absolute -bottom-1 left-0 right-0 h-8 bg-gradient-to-b from-black/10 to-transparent blur-lg" />
              
              {/* TV Inner Bezel */}
              <div className="relative bg-black rounded-2xl p-2 md:p-3 shadow-inner">
                {/* Screen Container */}
                <div 
                  ref={tvScreenRef}
                  className="relative aspect-video bg-black rounded-xl overflow-hidden"
                >
                  {/* Screen Glow Effect */}
                  <div className="absolute -inset-[2px] bg-gradient-to-br from-blue-500/10 via-transparent to-blue-500/5 rounded-xl" />
                  
                  {/* Video Display with Cross-Dissolve */}
                  <div className="relative w-full h-full bg-black overflow-hidden">
                    {currentFilm ? (
                      <div
                        key={currentFilm._id}
                        className={`absolute inset-0 transition-opacity ${
                          isTransitioning ? 'opacity-0 duration-500' : 'opacity-100 duration-700'
                        }`}
                      >
                        {currentFilm.videoUrl ? (
                          <video
                            key={currentFilm._id}
                            ref={videoRef}
                            src={currentFilm.videoUrl}
                            poster={currentFilm.thumbnail}
                            loop
                            muted
                            playsInline
                            preload="auto"
                            className="w-full h-full object-cover"
                            onLoadedMetadata={(e) => {
                              const video = e.currentTarget;
                              video.muted = true;
                              video.volume = 0;
                              if (!isPaused && isVisible) {
                                setTimeout(() => {
                                  video.play().catch((error) => {
                                    console.log('Video play failed on metadata:', error);
                                  });
                                }, 100);
                              }
                            }}
                            onCanPlay={(e) => {
                              const video = e.currentTarget;
                              video.muted = true;
                              video.volume = 0;
                              if (!isPaused && isVisible) {
                                video.play().catch((err) => {
                                  console.log('Video play failed on can play:', err);
                                });
                              }
                            }}
                            onError={(e) => {
                              console.error('Video load error:', e);
                            }}
                          />
                        ) : (
                          <img
                            src={currentFilm.thumbnail}
                            alt={currentFilm.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white/70 text-center px-6">
                        <div className="space-y-2">
                          <p className="tracking-[0.3em] text-xs uppercase text-white/50">Wedding Films</p>
                          <p className="text-lg md:text-xl font-light">Films coming soon</p>
                          <p className="text-sm text-white/60">We are curating the showcase.</p>
                        </div>
                      </div>
                    )}

                    {/* Subtle Film Grain */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><filter id=%22grain%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%221%22 numOctaves=%223%22 /></filter><rect width=%22100%22 height=%22100%22 filter=%22url(%23grain)%22/></svg>')]" />
                  </div>

                  {/* Edge Overlay Navigation (Fade in on hover) */}
                  <div className={`absolute inset-0 flex items-center justify-between px-4 pointer-events-none transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0 md:opacity-0'
                  }`}>
                    <button
                      onClick={() => {
                        goToPrevious();
                        handleUserInteraction();
                      }}
                      disabled={!hasFilms || isTransitioning}
                      className="pointer-events-auto p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-[#D4AF37]/50 transition-all disabled:opacity-30 group"
                      aria-label="Previous film"
                    >
                      <ChevronLeft className="w-5 h-5 text-white/80 group-hover:text-[#D4AF37] group-hover:transform group-hover:-translate-x-0.5 transition-all" />
                    </button>

                    <button
                      onClick={() => {
                        goToNext();
                        handleUserInteraction();
                      }}
                      disabled={!hasFilms || isTransitioning}
                      className="pointer-events-auto p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-[#D4AF37]/50 transition-all disabled:opacity-30 group"
                      aria-label="Next film"
                    >
                      <ChevronRight className="w-5 h-5 text-white/80 group-hover:text-[#D4AF37] group-hover:transform group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>

                  {/* Paused Indicator */}
                  {isPaused && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 animate-fadeIn">
                      <span className="text-xs text-white/90 font-light tracking-wider flex items-center gap-2">
                        <Pause className="w-3 h-3" fill="currentColor" />
                        Paused
                      </span>
                    </div>
                  )}

                  {/* Soft Progress Indicator (Glowing Line) */}
                  {!prefersReducedMotion && !isPaused && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
                      <div
                        ref={progressBarRef}
                        className="h-full bg-gradient-to-r from-[#D4AF37] via-[#f0d98c] to-[#D4AF37] origin-left shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                        style={{ transform: 'scaleX(0)' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* TV Stand/Base */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 md:w-40 h-6 md:h-8 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-b-xl shadow-lg" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-40 md:w-48 h-2 bg-[#0d0d0d] rounded-full shadow-xl opacity-40" />
            </div>

            {/* "NOW PLAYING" Overlay */}
            <div className="mt-12 md:mt-16 text-center">
              <div className="space-y-3 animate-slideUp">
                <div className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                  <span className="text-[10px] md:text-xs tracking-[0.4em] text-[#D4AF37] uppercase font-medium">
                    Now Playing
                  </span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl lg:text-4xl text-gray-900 font-light italic">
                  {currentFilm?.title || "Wedding films coming soon"}
                </h3>
                <p className="text-sm md:text-base text-gray-600 font-light">
                  {currentFilm?.category || "We'll unveil our studio showcase shortly."}
                </p>
              </div>
            </div>

            {/* Navigation Controls (Below TV) */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => {
                  goToPrevious();
                  handleUserInteraction();
                }}
                className="p-4 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:border-[#D4AF37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                aria-label="Previous film"
                disabled={!hasFilms || isTransitioning}
              >
                <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-[#D4AF37] transition-colors" />
              </button>

              <button
                onClick={() => {
                  setIsPaused(prev => !prev);
                  setUserInteracted(true);
                }}
                className="p-4 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:border-[#D4AF37]/30 transition-all group"
                aria-label={isPaused ? "Resume autoplay" : "Pause autoplay"}
                disabled={!hasFilms}
              >
                {isPaused ? (
                  <Play className="w-6 h-6 text-gray-700 group-hover:text-[#D4AF37] transition-colors" fill="currentColor" />
                ) : (
                  <Pause className="w-6 h-6 text-gray-700 group-hover:text-[#D4AF37] transition-colors" fill="currentColor" />
                )}
              </button>

              <button
                onClick={() => {
                  goToNext();
                  handleUserInteraction();
                }}
                className="p-4 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:border-[#D4AF37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                aria-label="Next film"
                disabled={!hasFilms || isTransitioning}
              >
                <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-[#D4AF37] transition-colors" />
              </button>
            </div>

            {/* Film Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {hasFilms ? (
                films.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isTransitioning) {
                        setIsTransitioning(true);
                        setCurrentIndex(index);
                        handleUserInteraction();
                        setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
                      }
                    }}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === currentIndex
                        ? 'w-12 bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.5)]'
                        : 'w-8 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to film ${index + 1}`}
                    aria-current={index === currentIndex}
                  />
                ))
              ) : (
                <span className="h-1.5 w-16 rounded-full bg-gray-300/70" aria-label="No films yet" />
              )}
            </div>

            {/* Film Counter Badge */}
            <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
              <span className="text-[10px] md:text-xs text-gray-700 font-medium tracking-wider">
                {String(currentIndex + 1).padStart(2, '0')} / {String(films.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </section>
  );
};

export default FilmsSection;