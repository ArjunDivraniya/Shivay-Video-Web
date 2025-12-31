import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Camera, Heart, Building2, PartyPopper, Sparkles, LucideIcon } from "lucide-react";
import { apiService, Service } from "@/services/api";
import weddingCeremony from "@/assets/wedding-ceremony.jpg";

// Icon map for dynamic icon rendering
const iconMap: Record<string, LucideIcon> = {
  Heart,
  Camera,
  Building2,
  PartyPopper,
  Sparkles,
};

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      const data = await apiService.getServices();
      setServices(data);
    };
    fetchServices();
  }, []);

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-overlay opacity-30" />

      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-sm tracking-widest-xl text-primary uppercase font-body mb-4 block">
            Services
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Types of <span className="text-gold-gradient">Shoots</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            Every occasion deserves to be captured with artistry and emotion
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Camera;
            return (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredId(service._id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative overflow-hidden rounded-sm cursor-pointer ${
                  index === 0 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                {/* Card */}
                <div className="relative h-80 overflow-hidden">
                  {/* Image */}
                  <motion.img
                    src={service.image || weddingCeremony}
                    alt={service.title}
                    className="w-full h-full object-cover"
                    animate={{
                      scale: hoveredId === service._id ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.6 }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-charcoal/60 group-hover:bg-charcoal/40 transition-colors duration-500" />

                  {/* Gold Border on Hover */}
                  <motion.div
                    className="absolute inset-4 border border-gold rounded-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: hoveredId === service._id ? 1 : 0,
                      scale: hoveredId === service._id ? 1 : 0.9,
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    {/* Icon */}
                    <motion.div
                      className="w-14 h-14 rounded-full border border-gold/50 flex items-center justify-center mb-4 bg-charcoal/30 backdrop-blur-sm"
                      animate={{
                        y: hoveredId === service._id ? -10 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <IconComponent className="w-6 h-6 text-gold" />
                    </motion.div>

                    {/* Title */}
                    <h3 className="font-display text-2xl text-ivory mb-2">
                      {service.title}
                    </h3>

                    {/* Description - Shows on Hover */}
                    <motion.p
                      className="font-body text-ivory/80 text-sm max-w-xs"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: hoveredId === service._id ? 1 : 0,
                        y: hoveredId === service._id ? 0 : 10,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {service.description}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
