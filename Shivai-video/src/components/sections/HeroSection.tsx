import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiService, HeroData } from "@/services/api";
import heroImage from "@/assets/hero-wedding.jpg";

const HeroSection = () => {
  const ref = useRef(null);
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  useEffect(() => {
    const fetchHeroData = async () => {
      const data = await apiService.getHeroData();
      if (data) {
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
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 0.8]);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ y: imageY, scale: imageScale }}
      >
        <motion.img
          src={heroData?.heroImage || heroImage}
          alt="Wedding photography showcasing beautiful Indian bride"
          className="h-full w-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
        />
      </motion.div>

      {/* Cinematic Overlay with Parallax */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/40 to-charcoal/80"
        style={{ opacity: overlayOpacity }}
      />

      {/* Film Grain Effect */}
      <div className="absolute inset-0 film-grain" />

      {/* Content with Parallax */}
      <motion.div 
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        {/* Location Tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-6"
        >
          <span className="font-body text-sm tracking-widest-xl text-ivory/90 uppercase">
            {heroData?.location || "Junagadh • Gujarat"}
          </span>
        </motion.div>

        {/* Studio Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl text-ivory font-semibold mb-4 drop-shadow-lg"
        >
          <span className="text-gold-gradient">{heroData?.studioName || "Shivay Video"}</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="font-display text-xl md:text-2xl text-ivory/95 italic mb-12 max-w-2xl drop-shadow-md"
        >
          {heroData?.tagline || "Where emotions become timeless frames"}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button variant="hero-primary" size="lg" className="min-w-[180px]">
            View Stories
          </Button>
          <Button variant="hero" size="lg" className="min-w-[180px] group">
            <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Watch Reel
          </Button>
        </motion.div>
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
