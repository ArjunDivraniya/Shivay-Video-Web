import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { Play } from "lucide-react";

const videos = [
  {
    id: 1,
    title: "Priya & Rahul's Wedding Film",
    category: "Wedding Film",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Coastal Pre-Wedding Reel",
    category: "Pre-Wedding",
    thumbnail: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Grand Sangeet Night",
    category: "Event Highlight",
    thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop",
  },
];

const VideoCard = ({ video, index }: { video: typeof videos[0], index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  // Parallax Logic for Video Thumbnails
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group relative overflow-hidden rounded-sm cursor-pointer"
    >
      {/* Thumbnail Container with Parallax */}
      <div className="relative aspect-video overflow-hidden">
        <motion.div 
          className="absolute inset-0 w-full h-[120%] -top-[10%]"
          style={{ y }}
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </motion.div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-charcoal/50 group-hover:bg-charcoal/30 transition-colors duration-500" />

        {/* Play Button */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
        >
          <div className="w-16 h-16 rounded-full bg-gold/20 backdrop-blur-sm border border-gold/50 flex items-center justify-center group-hover:bg-gold/30 transition-colors">
            <Play className="w-6 h-6 text-ivory ml-1" />
          </div>
        </motion.div>

        {/* Gold Frame */}
        <div className="absolute inset-4 border border-gold/0 group-hover:border-gold/30 rounded-sm transition-colors duration-500" />
      </div>

      {/* Info */}
      <div className="p-4 bg-charcoal-light relative z-10">
        <span className="text-xs font-body text-gold tracking-wider uppercase">
          {video.category}
        </span>
        <h3 className="font-display text-lg text-ivory mt-1">
          {video.title}
        </h3>
      </div>
    </motion.div>
  );
};

const FilmsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-charcoal overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-sm tracking-widest-xl text-gold uppercase font-body mb-4 block">
            Cinematography
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-ivory mb-4">
            Wedding <span className="text-gold-gradient">Films</span>
          </h2>
          <p className="font-body text-ivory/70 max-w-xl mx-auto">
            Cinematic stories that bring your moments to life
          </p>
        </motion.div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FilmsSection;