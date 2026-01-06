import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { MessageSquare, Camera, Palette, Gift } from "lucide-react";

const steps = [
  {
    id: 1,
    icon: MessageSquare,
    title: "Planning",
    description: "We discuss your vision, preferences, and the story you want to tell",
  },
  {
    id: 2,
    icon: Camera,
    title: "Shooting Day",
    description: "We capture every precious moment with artistry and attention to detail",
  },
  {
    id: 3,
    icon: Palette,
    title: "Editing",
    description: "Each photo is carefully curated and edited to perfection",
  },
  {
    id: 4,
    icon: Gift,
    title: "Delivery",
    description: "Your memories delivered in beautiful albums and digital formats",
  },
];

const ProcessSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState<number | null>(null);

  // Track which step is in viewport for guided focus
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!isInView) return;

    const observers = stepRefs.current.map((stepRef, index) => {
      if (!stepRef) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveStep(index);
            }
          });
        },
        {
          threshold: 0.6, // Step becomes active when 60% visible
          rootMargin: "-20% 0px -20% 0px",
        }
      );

      observer.observe(stepRef);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, [isInView]);

  return (
    <section 
      ref={ref} 
      className="relative py-32 md:py-40 overflow-hidden"
      style={{ backgroundColor: "#F6EFE8" }} // Warm ivory background
    >
      {/* Subtle grain texture overlay for luxury feel */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header - Editorial Hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-24 md:mb-32"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xs tracking-[0.3em] uppercase font-body mb-6 block"
            style={{ 
              color: "#A0826D",
              letterSpacing: "0.3em"
            }}
          >
            How We Work
          </motion.span>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-4xl md:text-6xl mb-6"
            style={{ 
              color: "#2C2416",
              fontWeight: 400,
              lineHeight: 1.2
            }}
          >
            Our <span className="text-gold-gradient">Process</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-body text-base md:text-lg max-w-2xl mx-auto"
            style={{ 
              color: "#7A6B5D",
              lineHeight: 1.8
            }}
          >
            From first conversation to final delivery
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Thin Gold Gradient Timeline Line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.4 }}
            className="absolute left-8 md:left-1/2 top-0 bottom-0 origin-top hidden md:block"
            style={{ 
              width: "1px",
              transform: "translateX(-50%)",
              background: "linear-gradient(180deg, rgba(212,175,55,0.3) 0%, rgba(184,134,11,0.6) 50%, rgba(212,175,55,0.3) 100%)"
            }}
          />

          {/* Steps */}
          <div className="space-y-20 md:space-y-32">
            {steps.map((step, index) => {
              const isActive = activeStep === index;
              const isLeft = index % 2 === 0;
              
              return (
                <motion.div
                  key={step.id}
                  ref={(el) => (stepRefs.current[index] = el)}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50, scale: 0.98 }}
                  animate={
                    isInView
                      ? { 
                          opacity: isActive ? 1 : 0.5, 
                          x: 0, 
                          scale: isActive ? 1 : 0.98 
                        }
                      : { opacity: 0, x: isLeft ? -50 : 50, scale: 0.98 }
                  }
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.5 + index * 0.15,
                    ease: "easeInOut"
                  }}
                  className={`relative flex items-center md:grid md:grid-cols-2 gap-12 md:gap-20 ${
                    isLeft ? "" : "md:direction-rtl"
                  }`}
                >
                  {/* Premium Card */}
                  <div
                    className={`${
                      isLeft ? "md:text-right md:pr-20" : "md:text-left md:pl-20 md:col-start-2"
                    }`}
                  >
                    <motion.div
                      animate={{
                        boxShadow: isActive 
                          ? "0 2px 16px rgba(0, 0, 0, 0.04)" 
                          : "0 1px 8px rgba(0, 0, 0, 0.02)"
                      }}
                      transition={{ duration: 0.4 }}
                      className="relative p-8 md:p-10 overflow-hidden"
                      style={{ 
                        backgroundColor: "#FDFBF7",
                        borderRadius: "16px",
                        border: `1px solid ${isActive ? "#D4AF37" : "#E8DFD0"}`,
                      }}
                    >
                      {/* Subtle gradient overlay */}
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: isActive 
                            ? "linear-gradient(135deg, rgba(212, 175, 55, 0.03) 0%, transparent 100%)"
                            : "none",
                          transition: "all 0.4s ease"
                        }}
                      />
                      
                      <div className="relative z-10">
                        <div className="flex items-start gap-5 mb-6">
                          {/* Smaller, refined icon */}
                          <motion.div
                            animate={{
                              boxShadow: isActive
                                ? "0 4px 12px rgba(212, 175, 55, 0.15)"
                                : "0 0 0px rgba(212, 175, 55, 0)"
                            }}
                            transition={{ duration: 0.3 }}
                            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: isActive ? "rgba(212, 175, 55, 0.12)" : "rgba(160, 130, 109, 0.08)"
                            }}
                          >
                            <step.icon 
                              className="w-5 h-5"
                              style={{ 
                                color: isActive ? "#B8860B" : "#A0826D",
                                strokeWidth: 1.5
                              }}
                            />
                          </motion.div>
                          
                          <div className="flex-1">
                            {/* Clear hierarchy */}
                            <span 
                              className="text-[10px] font-body tracking-[0.2em] uppercase block mb-2"
                              style={{ color: "#A0826D" }}
                            >
                              STEP {step.id}
                            </span>
                            <h3 
                              className="font-display text-2xl md:text-3xl mb-3"
                              style={{ 
                                color: isActive ? "#2C2416" : "#5D5343",
                                fontWeight: 400,
                                lineHeight: 1.3
                              }}
                            >
                              {step.title}
                            </h3>
                            <p 
                              className="font-body text-sm md:text-base leading-relaxed"
                              style={{ 
                                color: isActive ? "#5D5343" : "#877B6A",
                                lineHeight: 1.7
                              }}
                            >
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Refined Timeline Dot */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={
                      isInView
                        ? { scale: 1 }
                        : { scale: 0 }
                    }
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.15 }}
                    className="absolute left-8 md:left-1/2 w-12 h-12 rounded-full flex items-center justify-center hidden md:flex"
                    style={{ 
                      transform: "translateX(-50%)",
                      backgroundColor: "#F6EFE8"
                    }}
                  >
                    {/* Outline dot with gold fill when active */}
                    <motion.div
                      animate={{
                        scale: isActive ? [1, 1.08, 1] : 1,
                      }}
                      transition={{ 
                        scale: { duration: 0.5, times: [0, 0.5, 1] }
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ 
                        border: `2px solid ${isActive ? "#D4AF37" : "#D4C4B0"}`,
                        backgroundColor: isActive ? "#D4AF37" : "transparent"
                      }}
                    >
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="w-3 h-3 rounded-full"
                          style={{ 
                            backgroundColor: "#F6EFE8",
                            boxShadow: "0 0 8px rgba(212, 175, 55, 0.5)"
                          }}
                        />
                      )}
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
