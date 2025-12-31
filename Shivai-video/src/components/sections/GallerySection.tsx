import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { apiService, GalleryImage as ApiGalleryImage } from "@/services/api";
import gallery1 from "@/assets/gallery-1.jpg";

type GalleryImage = ApiGalleryImage & {
  depth?: number;
};

// Individual gallery item with parallax
const GalleryItem = ({ 
  image, 
  index, 
  scrollYProgress 
}: { 
  image: GalleryImage; 
  index: number;
  scrollYProgress: any;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  // Each image has different parallax depth
  const depth = image.depth || 0.1;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${depth * 100}%`, `-${depth * 100}%`]
  );
  
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 1 + depth * 0.5, 1]
  );

  // Staggered reveal delays based on position
  const row = Math.floor(index / 4);
  const col = index % 4;
  const staggerDelay = (row * 0.15) + (col * 0.1);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.8, 
        delay: staggerDelay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={`group relative overflow-hidden rounded-sm cursor-pointer ${image.span || ""}`}
    >
      {/* Parallax image container */}
      <motion.div 
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
        style={{ y, scale }}
      >
        <motion.img
          src={image.src || gallery1}
          alt={image.alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          initial={{ filter: "blur(8px)", scale: 1.1 }}
          animate={isInView ? { filter: "blur(0px)", scale: 1 } : {}}
          transition={{ duration: 1, delay: staggerDelay + 0.2 }}
        />
      </motion.div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition-colors duration-500" />

      {/* Gold Frame on Hover */}
      <motion.div
        className="absolute inset-3 border border-gold/50 rounded-sm"
        initial={{ opacity: 0, scale: 0.9 }}
        whileHover={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-ivory/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ transform: "translateX(-100%)" }}
        whileHover={{ transform: "translateX(100%)" }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
};

const GallerySection = () => {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    const fetchGallery = async () => {
      const data = await apiService.getGallery();
      // Add random depth values for parallax effect
      const imagesWithDepth = data.map((img, index) => ({
        ...img,
        depth: 0.06 + (index % 5) * 0.03,
      }));
      setGalleryImages(imagesWithDepth);
    };
    fetchGallery();
  }, []);

  return (
    <section ref={containerRef} className="relative py-24 md:py-32 bg-ivory overflow-hidden">
      {/* Floating decorative elements with parallax */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 border border-gold/20 rounded-full"
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
      />
      <motion.div
        className="absolute bottom-40 right-20 w-24 h-24 border border-gold/15 rounded-full"
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 80]) }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.span 
            className="text-sm tracking-widest-xl text-primary uppercase font-body mb-4 block"
            initial={{ opacity: 0, y: 10 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Editor's Choice
          </motion.span>
          <motion.h2 
            className="font-display text-4xl md:text-5xl text-charcoal mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Highlight <span className="text-gold-gradient">Gallery</span>
          </motion.h2>
          <motion.p 
            className="font-body text-charcoal-light max-w-xl mx-auto"
            initial={{ opacity: 0, y: 15 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Curated moments that tell stories of love, joy, and celebration
          </motion.p>
        </motion.div>

        {/* Masonry Gallery with Parallax */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {galleryImages.map((image, index) => (
            <GalleryItem
              key={image._id}
              image={image}
              index={index}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
