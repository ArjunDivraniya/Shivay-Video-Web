import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import couplePortrait from "@/assets/couple-portrait.jpg";

const IntroSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Subtle Pattern */}
      <div className="absolute inset-0 pattern-overlay opacity-50" />

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content - Book Page Left */}
          <motion.div
            initial={{ opacity: 0, rotateY: -90, x: -50 }}
            animate={isInView ? { opacity: 1, rotateY: 0, x: 0 } : {}}
            transition={{ duration: 1, ease: "easeOut" }}
            className="order-2 lg:order-1"
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          >
            <div className="max-w-lg">
              <motion.span
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-sm tracking-widest-xl text-primary uppercase font-body mb-4 block"
              >
                Our Story
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="font-display text-4xl md:text-5xl text-foreground mb-6 leading-tight"
              >
                Crafting Memories,
                <br />
                <span className="text-gold-gradient">Frame by Frame</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="font-body text-muted-foreground text-lg leading-relaxed mb-6"
              >
                We believe every love story deserves to be told with the same magic 
                it was lived. At Aura Studios, we don't just capture moments — we 
                preserve emotions, freeze laughter, and immortalize the fleeting 
                glances that speak volumes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex items-center gap-4"
              >
                <div className="h-px bg-primary w-12" />
                <p className="font-display text-primary italic text-lg">
                  "Emotions are our canvas, light is our brush"
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Image - Book Page Right */}
          <motion.div
            initial={{ opacity: 0, rotateY: 90, x: 50 }}
            animate={isInView ? { opacity: 1, rotateY: 0, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="order-1 lg:order-2 relative"
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          >
            <div className="relative">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-sm shadow-elevated">
                <img
                  src={couplePortrait}
                  alt="Beautiful wedding couple portrait"
                  className="w-full h-[500px] md:h-[600px] object-cover"
                />
                {/* Gold Frame Border */}
                <div className="absolute inset-4 border border-gold/30 rounded-sm pointer-events-none" />
              </div>

              {/* Decorative Element */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -bottom-6 -left-6 w-32 h-32 border border-gold/40 rounded-full flex items-center justify-center bg-background"
              >
                <div className="text-center">
                  <p className="font-display text-3xl text-primary font-semibold">8+</p>
                  <p className="font-body text-xs text-muted-foreground tracking-wide">Years</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
