import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { apiService, WeddingStory } from "@/services/api";
import weddingCeremony from "@/assets/wedding-ceremony.jpg";

// Progress Bar Component
const ProgressIndicator = ({ 
  scrollYProgress, 
  index,
  total 
}: { 
  scrollYProgress: MotionValue<number>; 
  index: number;
  total: number;
}) => {
  const step = 1 / total;
  const start = index * step;
  const end = (index + 1) * step;

  const scaleX = useTransform(
    scrollYProgress,
    [start, end],
    [0, 1]
  );

  return (
    <motion.div className="w-8 h-1 bg-ivory/20 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gold"
        style={{
          scaleX,
          transformOrigin: "left",
        }}
      />
    </motion.div>
  );
};

const StoryCard = ({ story, index }: { story: WeddingStory; index: number }) => (
  <div className="relative flex-shrink-0 w-[85vw] md:w-[65vw] h-[65vh] md:h-[70vh]">
    <div className="relative h-full overflow-hidden rounded-sm group">
      <img
        src={story.image || story.coverPhoto?.url || weddingCeremony}
        alt={story.coupleName || story.couple}
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent" />
      <div className="absolute bottom-8 left-8 right-8">
        <span className="font-body text-[10px] tracking-[0.3em] text-gold uppercase mb-3 block">
          {String(index + 1).padStart(2, '0')} — {story.serviceType || story.event}
        </span>
        <h3 className="font-display text-3xl md:text-5xl text-ivory mb-2">
          {story.coupleName || story.couple}
        </h3>
        <p className="font-body text-ivory/60 text-xs md:text-sm tracking-wide">
          {story.place || story.location}
        </p>
      </div>
    </div>
  </div>
);

const WeddingStoriesSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stories, setStories] = useState<WeddingStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await apiService.getWeddingStories();
        setStories(data);
      } catch (error) {
        console.error('Failed to load wedding stories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, []);

  // Use percentages instead of vw for the x transform to avoid alignment drift
  const x = useTransform(
    scrollYProgress, 
    [0, 1], 
    ["0%", `-${stories.length > 0 ? (stories.length - 1) * 80 : 0}%`]
  );

  if (!isLoading && stories.length === 0) return null;

  return (
    <section 
      ref={containerRef} 
      className="relative bg-charcoal"
      // Multiply height by stories to make the scroll speed feel natural
      style={{ height: `${Math.max(stories.length * 100, 300)}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">
        {/* Header Title */}
        <div className="absolute top-12 left-6 md:left-12 z-20">
          <span className="text-[10px] tracking-[0.4em] text-gold uppercase font-body block mb-3">
            Portfolio
          </span>
          <h2 className="font-display text-4xl md:text-7xl text-ivory">
            Wedding Stories
          </h2>
        </div>

        {/* Progress Bars */}
        <div className="absolute top-16 right-6 md:right-12 z-20 flex items-center gap-3">
          {!isLoading && stories.map((_, index) => (
            <ProgressIndicator 
              key={index} 
              scrollYProgress={scrollYProgress} 
              index={index}
              total={stories.length}
            />
          ))}
        </div>

        {/* Main Horizontal Track */}
        <div className="flex h-full items-center">
          <motion.div
            style={{ x }}
            className="flex items-center gap-12 md:gap-24 px-6 md:px-24 will-change-transform"
          >
            {isLoading ? (
              <div className="w-screen flex justify-center">
                <p className="font-display text-2xl text-gold animate-pulse">Loading...</p>
              </div>
            ) : (
              stories.map((story, index) => (
                <StoryCard key={story._id} story={story} index={index} />
              ))
            )}
            {/* End buffer */}
            <div className="w-[10vw] flex-shrink-0" />
          </motion.div>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute bottom-10 left-6 md:left-12 pointer-events-none opacity-5">
          <p className="font-display text-[15vh] text-ivory leading-none select-none">
            SHIVAY
          </p>
        </div>
      </div>
    </section>
  );
};

export default WeddingStoriesSection;