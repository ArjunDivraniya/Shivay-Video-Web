import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiService, HeroData } from "@/services/api";
import heroImage from "@/assets/hero-wedding.jpg";

interface HeroStyles {
  textColor: string;
  studioNameColor?: string;
  locationColor?: string;
  taglineColor?: string;
  overlayOpacity: number;
  justifyContent: "flex-start" | "flex-center" | "flex-end";
  alignItems: "flex-start" | "flex-center" | "flex-end";
  verticalSpacing: number;
}

interface HeroFullData extends HeroData {
  styles?: HeroStyles;
  title?: string;
  subtitle?: string;
}

const getFlexValue = (value: string) => {
  if (value === "flex-start") return "flex-start";
  if (value === "flex-center") return "center";
  if (value === "flex-end") return "flex-end";
  return value;
};

const HeroSection = () => {
  const ref = useRef(null);
  const [heroData, setHeroData] = useState<HeroFullData | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  useEffect(() => {
    const fetchHeroData = async () => {
      const data = await apiService.getHeroData();
      if (data) {
        console.log('🎬 Hero Data Fetched:', data);
        console.log('🎨 Hero Styles:', data?.styles);
        setHeroData(data);
      }
    };
    fetchHeroData();
  }, []);

  // Parallax effects
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  const baseOverlayOpacity = heroData?.styles?.overlayOpacity ?? 0.5;
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [baseOverlayOpacity, Math.min(baseOverlayOpacity + 0.3, 0.9)]);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleViewStories = () => {
    scrollToSection("stories");
  };

  const handleWatchReel = () => {
    scrollToSection("films");
  };

  const handleBookDate = () => {
    scrollToSection("contact");
  };

  const styles = heroData?.styles || {
    textColor: "#ffffff",
    overlayOpacity: 0.5,
    justifyContent: "flex-center",
    alignItems: "flex-center",
    verticalSpacing: 0,
  };

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Parallax - Use <picture> for responsive */}
      <motion.div
        className="absolute inset-0"
        style={{ y: imageY, scale: imageScale }}
      >
        <motion.picture>
          {heroData?.mobileImageUrl && (
            <source
              media="(max-width: 768px)"
              srcSet={heroData.mobileImageUrl}
            />
          )}
          <motion.img
            src={heroData?.heroImage || heroImage}
            alt="Wedding photography showcasing beautiful Indian bride"
            className="h-full w-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
          />
        </motion.picture>
      </motion.div>

      {/* Overlay with Admin-Controlled Opacity */}
      <motion.div 
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />

      {/* Film Grain Effect */}
      <div className="absolute inset-0 film-grain" />

      {/* Content with Parallax - Position controlled by admin */}
      <motion.div 
        className="relative z-10 flex h-full px-6"
        style={{ 
          y: contentY, 
          opacity: contentOpacity,
          justifyContent: getFlexValue(styles.justifyContent),
          alignItems: getFlexValue(styles.alignItems),
          paddingTop: `${styles.verticalSpacing}px`,
        }}
      >
        <div className="text-center flex flex-col items-center justify-center">
          {/* Location Tag */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-6"
          >
            <span 
              className="font-body text-sm tracking-widest-xl uppercase drop-shadow-lg"
              style={{ color: styles.locationColor || styles.textColor }}
            >
              {heroData?.location || "Junagadh • Gujarat"}
            </span>
          </motion.div>

          {/* Studio Name */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold mb-4 drop-shadow-lg"
            style={{ color: styles.studioNameColor || styles.textColor }}
          >
            {heroData?.studioName || "Shivay Video"}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="font-display text-xl md:text-2xl italic mb-12 max-w-2xl drop-shadow-md"
            style={{ color: styles.taglineColor || styles.textColor }}
          >
            {heroData?.tagline || "Where emotions become timeless frames"}
          </motion.p>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer z-20"
        aria-label="Scroll down"
        style={{ opacity: contentOpacity }}
      >
        <div className="scroll-indicator flex flex-col items-center gap-2 text-ivory/70 hover:text-ivory transition-colors">
          <span className="text-xs tracking-widest uppercase font-body">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </motion.button>
    </section>
  );
};

export default HeroSection;
