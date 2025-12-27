import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import couplePortrait from "@/assets/couple-portrait.jpg";

const stats = [
  { value: "500+", label: "Weddings" },
  { value: "8+", label: "Years" },
  { value: "50+", label: "Destinations" },
  { value: "100%", label: "Happy Couples" },
];

const AboutSection = () => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 1.02]);
  const frameY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  return (
    <section ref={containerRef} className="relative py-24 md:py-32 bg-cream overflow-hidden">
      {/* Background Parallax Image */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{ y: backgroundY }}
      >
        <img
          src={couplePortrait}
          alt="Background"
          className="w-full h-[120%] object-cover"
        />
      </motion.div>

      <div ref={ref} className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image with Parallax */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-sm">
              <motion.div style={{ y: imageY, scale: imageScale }}>
                <img
                  src={couplePortrait}
                  alt="Aura Studios team"
                  className="w-full h-[500px] object-cover shadow-elevated"
                />
              </motion.div>
              
              {/* Decorative frame with opposite parallax */}
              <motion.div 
                className="absolute -inset-4 border border-gold/30 rounded-sm -z-10"
                style={{ y: frameY }}
              />
            </div>
            
            {/* Floating badge with parallax */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]) }}
              className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-background border-2 border-gold/40 flex items-center justify-center shadow-elevated"
            >
              <div className="text-center">
                <p className="font-display text-2xl text-primary font-semibold">8+</p>
                <p className="font-body text-xs text-muted-foreground">Years</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Content with subtle parallax */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ y: contentY }}
          >
            <span className="text-sm tracking-widest-xl text-primary uppercase font-body mb-4 block">
              About Us
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-6">
              The Heart Behind
              <br />
              <span className="text-gold-gradient">Aura Studios</span>
            </h2>

            <div className="space-y-4 mb-8">
              <p className="font-body text-charcoal-light leading-relaxed">
                Founded in Junagadh, Gujarat, Aura Studios has been weaving visual 
                stories of love and celebration for over 8 years. What started as a 
                passion for capturing genuine emotions has grown into a trusted name 
                in wedding and event photography.
              </p>
              <p className="font-body text-charcoal-light leading-relaxed">
                Our philosophy is simple: every frame should feel like a cherished 
                memory, not just a photograph. We blend traditional artistry with 
                modern cinematic techniques to create timeless visual narratives.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <p className="font-display text-3xl text-primary font-semibold">
                    {stat.value}
                  </p>
                  <p className="font-body text-sm text-charcoal-light mt-1">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
