import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { apiService, Testimonial } from "@/services/api";

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error('Failed to load testimonials:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const nextTestimonial = () => {
    if (testimonials.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    if (testimonials.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-charcoal overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-overlay opacity-5" />

      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-sm tracking-widest-xl text-gold uppercase font-body mb-4 block">
            Testimonials
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-ivory mb-4">
            Client <span className="text-gold-gradient">Stories</span>
          </h2>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto relative">
          {isLoading ? (
            <div className="text-center text-ivory/80 font-body">Loading testimonials...</div>
          ) : testimonials.length === 0 ? (
            <div className="text-center text-ivory/80 font-body">No testimonials yet. Add one in the admin panel to display it here.</div>
          ) : (
            <>
              <div className="overflow-hidden">
                <motion.div
                  className="flex"
                  animate={{ x: `-${activeIndex * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {testimonials.map((testimonial) => (
                    <div
                      key={testimonial._id}
                      className="w-full flex-shrink-0 px-4"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        className="text-center"
                      >
                        {/* Quote Icon */}
                        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-8">
                          <Quote className="w-8 h-8 text-gold" />
                        </div>

                        {/* Quote Text */}
                        <p className="font-display text-2xl md:text-3xl text-ivory/90 italic leading-relaxed mb-8">
                          "{testimonial.quote}"
                        </p>

                        {/* Couple Info */}
                        <div>
                          <p className="font-display text-xl text-gold">
                            {testimonial.couple}
                          </p>
                          <p className="font-body text-ivory/60 text-sm mt-1">
                            {testimonial.event}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={prevTestimonial}
                  disabled={testimonials.length === 0}
                  className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-ivory hover:bg-gold/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Dots */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === activeIndex
                          ? "bg-gold w-6"
                          : "bg-ivory/30 hover:bg-ivory/50"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTestimonial}
                  disabled={testimonials.length === 0}
                  className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-ivory hover:bg-gold/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
