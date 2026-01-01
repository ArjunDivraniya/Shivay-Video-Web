import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { apiService, WeddingStory } from "@/services/api";
import weddingCeremony from "@/assets/wedding-ceremony.jpg";

// Progress Bar Component
const ProgressIndicator = ({ 
  scrollYProgress, 
  index 
}: { 
  scrollYProgress: MotionValue<number>; 
  index: number;
}) => {
  const scaleX = useTransform(
    scrollYProgress,
    [index * 0.25, (index + 1) * 0.25],
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

// Story Card with Internal Parallax
const StoryCard = ({ 
  story, 
  index, 
  scrollYProgress,
  totalStories
}: { 
  story: WeddingStory; 
  index: number;
  scrollYProgress: MotionValue<number>;
  totalStories: number;
}) => {
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", "15%"]
  );

  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 1.05, 1.1]
  );

  return (
    <motion.div
      className="relative flex-shrink-0 w-[85vw] md:w-[60vw] h-[70vh]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative h-full overflow-hidden rounded-sm group">
        <motion.div
          className="absolute inset-0 w-full h-[120%] -top-[10%]"
          style={{ y: imageY, scale: imageScale }}
        >
          <img
            src={story.image || weddingCeremony}
            alt={`${story.couple} wedding story`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />
        <div className="absolute inset-6 border border-gold/20 rounded-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute bottom-8 left-8 right-8">
          <span className="font-body text-xs tracking-widest text-gold uppercase mb-2 block">
            {String(index + 1).padStart(2, '0')} / {story.event}
          </span>
          <h3 className="font-display text-3xl md:text-4xl text-ivory mb-2">
            {story.couple}
          </h3>
          <p className="font-body text-ivory/70 text-sm">
            {story.location}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const WeddingStoriesSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stories, setStories] = useState<WeddingStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
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

  // --- CRITICAL FIX ---
  // We use 'vw' units, not '%'. 
  // 4 cards * 85vw width = approx 340vw total width.
  // To reach the end, we shift left by approx 255vw.
  // Using `totalCards - 1` ensures we stop exactly on the last card.
  const totalScrollVW = Math.max((stories.length - 1) * 85, 0); 
  
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", `-${totalScrollVW}vw`]);

  return (
    <section 
      ref={containerRef} 
      className="relative bg-charcoal"
      // Height controls the speed. 350vh is a comfortable scroll length.
      style={{ height: "350vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">
        {/* Header */}
        <div className="absolute top-10 left-6 md:left-12 z-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-sm tracking-widest-xl text-gold uppercase font-body block mb-2"
          >
            Portfolio
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl text-ivory"
          >
            Wedding Stories
          </motion.h2>
        </div>

        {/* Progress Indicators */}
        <div className="absolute top-10 right-6 md:right-12 z-20 flex items-center gap-2">
          {stories.map((_, index) => (
            <ProgressIndicator 
              key={index} 
              scrollYProgress={scrollYProgress} 
              index={index} 
            />
          ))}
        </div>

        {/* Horizontal Container */}
        {/* Added w-max to ensure container wraps all cards horizontally */}
        <motion.div
          style={{ x }}
          className="flex items-center gap-6 md:gap-16 px-6 md:px-24 w-max h-full pt-10"
        >
          {isLoading ? (
            <div className="text-ivory text-center w-full">
              <p className="font-display text-2xl">Loading wedding stories...</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-ivory text-center w-full">
              <p className="font-display text-2xl">No wedding stories found.</p>
              <p className="font-body text-ivory/70 mt-2">Add stories in the admin panel to see them here.</p>
            </div>
          ) : (
            stories.map((story, index) => (
              <StoryCard
                key={story._id}
                story={story}
                index={index}
                scrollYProgress={scrollYProgress}
                totalStories={stories.length}
              />
            ))
          )}
          
          {/* Spacer to keep last card visible */}
          {stories.length > 0 && <div className="w-[5vw] flex-shrink-0" />}
        </motion.div>
      </div>
    </section>
  );
};

export default WeddingStoriesSection;