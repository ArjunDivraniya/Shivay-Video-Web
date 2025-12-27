import { motion, useInView } from "framer-motion";
import { useRef } from "react";
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

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-sm tracking-widest-xl text-primary uppercase font-body mb-4 block">
            How We Work
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Our <span className="text-gold-gradient">Process</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            From first conversation to final delivery
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border origin-top hidden md:block"
            style={{ transform: "translateX(-50%)" }}
          />

          {/* Steps */}
          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
                className={`relative flex items-center md:grid md:grid-cols-2 gap-8 ${
                  index % 2 === 0 ? "" : "md:direction-rtl"
                }`}
              >
                {/* Content */}
                <div
                  className={`${
                    index % 2 === 0 ? "md:text-right md:pr-16" : "md:text-left md:pl-16 md:col-start-2"
                  }`}
                >
                  <div className="bg-card p-6 rounded-sm border border-border shadow-soft">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-xs font-body text-muted-foreground tracking-wider">
                          STEP {step.id}
                        </span>
                        <h3 className="font-display text-xl text-foreground">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="font-body text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Node */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.2 }}
                  className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center hidden md:flex"
                  style={{ transform: "translateX(-50%)" }}
                >
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
