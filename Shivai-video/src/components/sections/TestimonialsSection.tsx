import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { apiService, Testimonial } from "@/services/api";

// Editorial Quote Reveal Component
const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  // Split quote into lines for sequential reveal
  const lines = testimonial.quote.split('. ').map((line, i, arr) => 
    i < arr.length - 1 ? line + '.' : line
  );

  return (
    <div
      ref={cardRef}
      className="max-w-4xl mx-auto mb-32 md:mb-40 px-4 md:px-8"
    >
      {/* 1️⃣ Quotation Mark - Appears First */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="mb-8 md:mb-12"
      >
        <span className="text-6xl md:text-8xl text-gold/30 font-serif leading-none block">
          "
        </span>
      </motion.div>

      {/* 2️⃣ Quote Text - Line by Line Reveal */}
      <div className="mb-8 md:mb-12">
        {lines.map((line, lineIndex) => (
          <motion.p
            key={lineIndex}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{
              duration: 0.4,
              delay: 0.5 + lineIndex * 0.25, // Sequential delay
              ease: "easeInOut",
            }}
            className="font-serif text-2xl md:text-4xl text-ivory/90 leading-relaxed mb-4 md:mb-6"
          >
            {line}
          </motion.p>
        ))}
      </div>

      {/* Optional Divider Line */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
        transition={{
          duration: 0.4,
          delay: 0.5 + lines.length * 0.25,
          ease: "easeInOut",
        }}
        className="h-px w-24 bg-gold/30 mx-auto md:mx-0 mb-8"
      />

      {/* 3️⃣ Client Name & Details - Appears Last */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{
          duration: 0.35,
          delay: 0.8 + lines.length * 0.25,
          ease: "easeInOut",
        }}
        className="text-center md:text-left"
      >
        <p className="font-body text-lg md:text-xl text-gold/90 mb-2">
          {testimonial.couple}
        </p>
        <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-ivory/50">
          <span>{testimonial.event}</span>
          {testimonial.place && (
            <>
              <span>•</span>
              <span>{testimonial.place}</span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const TestimonialsSection = () => {
  const sectionRef = useRef(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.getTestimonials();
        console.log('Testimonials fetched:', data);
        
        if (data && data.length > 0) {
          setTestimonials(data);
        } else {
          setError('No testimonials available');
        }
      } catch (error) {
        console.error('Failed to load testimonials:', error);
        setError('Failed to load testimonials. Please try again later.');
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
            <div className="text-center text-ivory/80 font-body py-12">
              <div className="inline-block">
                <div className="w-8 h-8 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
              </div>
              <p className="mt-4">Loading testimonials...</p>
            </div>
          ) : error || testimonials.length === 0 ? (
            <div className="text-center py-12 border border-orange-500/30 rounded-lg bg-orange-500/5">
              <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-4" />
              <p className="text-ivory/80 font-body mb-2">
                {error || 'No testimonials yet'}
              </p>
              <p className="text-ivory/60 text-sm font-body">
                Add testimonials in the admin panel to display them here.
              </p>
            </div>
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
                        {/* Client Image */}
                        {testimonial.imageUrl && (
                          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6 border-2 border-gold/30 flex items-center justify-center bg-gold/10">
                            <img
                              src={testimonial.imageUrl}
                              alt={testimonial.couple}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

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
                          <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
                            <p className="font-body text-ivory/60 text-sm">
                              {testimonial.event}
                            </p>
                            {testimonial.place && (
                              <>
                                <span className="text-ivory/40">•</span>
                                <p className="font-body text-ivory/60 text-sm">
                                  {testimonial.place}
                                </p>
                              </>
                            )}
                          </div>
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
