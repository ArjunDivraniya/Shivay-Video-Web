import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar, MapPin, PartyPopper, Heart, Sparkles, Users, Briefcase, Camera } from "lucide-react";
import { apiService, Service } from "@/services/api";

// Category themes with unique styling
const categoryThemes = {
  Wedding: {
    icon: Heart,
    gradient: "from-rose-50 via-pink-50 to-rose-50",
    accentColor: "#D4AF37",
    borderColor: "#F4C2C2",
    textColor: "#8B0000",
    pattern: "wedding",
    emoji: "💍"
  },
  "Pre-Wedding": {
    icon: Heart,
    gradient: "from-pink-50 via-purple-50 to-pink-50",
    accentColor: "#E91E63",
    borderColor: "#F8BBD0",
    textColor: "#880E4F",
    pattern: "prewedding",
    emoji: "💕"
  },
  Engagement: {
    icon: Sparkles,
    gradient: "from-amber-50 via-yellow-50 to-amber-50",
    accentColor: "#FFB300",
    borderColor: "#FFE082",
    textColor: "#F57F17",
    pattern: "engagement",
    emoji: "💫"
  },
  Haldi: {
    icon: Sparkles,
    gradient: "from-yellow-100 via-amber-100 to-yellow-100",
    accentColor: "#FFA000",
    borderColor: "#FFECB3",
    textColor: "#E65100",
    pattern: "haldi",
    emoji: "🌼"
  },
  Mehndi: {
    icon: Sparkles,
    gradient: "from-green-50 via-emerald-50 to-green-50",
    accentColor: "#00897B",
    borderColor: "#A5D6A7",
    textColor: "#004D40",
    pattern: "mehndi",
    emoji: "🌿"
  },
  Sangeet: {
    icon: PartyPopper,
    gradient: "from-purple-50 via-fuchsia-50 to-purple-50",
    accentColor: "#AB47BC",
    borderColor: "#E1BEE7",
    textColor: "#6A1B9A",
    pattern: "sangeet",
    emoji: "🎵"
  },
  Birthday: {
    icon: PartyPopper,
    gradient: "from-blue-50 via-cyan-50 to-blue-50",
    accentColor: "#26C6DA",
    borderColor: "#B2EBF2",
    textColor: "#006064",
    pattern: "birthday",
    emoji: "🎂"
  },
  "Corporate Event": {
    icon: Briefcase,
    gradient: "from-slate-50 via-gray-50 to-slate-50",
    accentColor: "#455A64",
    borderColor: "#CFD8DC",
    textColor: "#263238",
    pattern: "corporate",
    emoji: "💼"
  },
  Other: {
    icon: Camera,
    gradient: "from-gray-50 via-zinc-50 to-gray-50",
    accentColor: "#D4AF37",
    borderColor: "#E5E7EB",
    textColor: "#374151",
    pattern: "default",
    emoji: "📸"
  }
};

// Normalize category text to Title Case for matching themes
const normalizeCategory = (value: string) => {
  return value
    ?.trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Resolve theme for a category, falling back to "Other"
const getTheme = (category: string) => {
  const normalized = normalizeCategory(category || "");
  return categoryThemes[category as keyof typeof categoryThemes]
    || categoryThemes[normalized as keyof typeof categoryThemes]
    || categoryThemes.Other;
};

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [services, setServices] = useState<Service[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    date: "",
    message: "",
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('[ContactSection] Fetching services...');
        const data = await apiService.getServices();
        console.log('[ContactSection] Fetched services:', data);
        
        if (data && data.length > 0) {
          setServices(data);
          
          // Extract unique service types/categories
          const categories = [...new Set(
            data
              .filter(s => s.serviceType)
              .map(s => normalizeCategory(s.serviceType as string))
          )];
          
          // Add "Other" as fallback
          if (!categories.includes("Other")) {
            categories.push("Other");
          }
          
          console.log('[ContactSection] Categories:', categories);
          setEventTypes(categories);
          
          // Set first category as default
          if (categories.length > 0) {
            setSelectedEvent(categories[0]);
          }
        } else {
          // Fallback to hardcoded categories
          const fallbackTypes = Object.keys(categoryThemes);
          setEventTypes(fallbackTypes);
          setSelectedEvent(fallbackTypes[0]);
        }
      } catch (error) {
        console.error('[ContactSection] Failed to load services:', error);
        // Fallback to hardcoded categories
        const fallbackTypes = Object.keys(categoryThemes);
        setEventTypes(fallbackTypes);
        setSelectedEvent(fallbackTypes[0]);
      }
    };
    
    fetchServices();
  }, []);

  // Get theme for selected event, fallback to Other if not found
  const currentTheme = getTheme(selectedEvent);
  const ThemeIcon = currentTheme.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hi! I'm ${formData.name} from ${formData.city}. I'm interested in ${selectedEvent} photography for ${formData.date}. ${formData.message}`;
    const whatsappUrl = `https://wa.me/919106572374?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden" style={{ backgroundColor: "#F9F7F4" }}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, ${currentTheme.accentColor}20 1px, transparent 1px)`,
          backgroundSize: "30px 30px"
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              {currentTheme.emoji}
            </motion.div>
            <span className="text-xs tracking-[0.3em] uppercase font-body mb-4 block" style={{ color: currentTheme.textColor }}>
              Reserve Your Special Moment
            </span>
            <h2 className="font-display text-4xl md:text-6xl mb-4 flex items-center justify-center gap-3 flex-wrap" style={{ color: currentTheme.textColor }}>
              <span>Book Your</span>
              <span 
                className="inline-block px-6 py-2 rounded-xl text-white shadow-lg"
                style={{ 
                  backgroundColor: currentTheme.accentColor,
                  boxShadow: `0 8px 30px ${currentTheme.accentColor}60`
                }}
              >
                Date
              </span>
            </h2>
            <p className="font-body text-muted-foreground max-w-xl mx-auto">
              Let's create timeless memories together
            </p>
          </motion.div>

          {/* Premium Marriage Card Style Form */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="relative"
          >
            {/* Floating Card with Category-Based Theme */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className={`relative bg-gradient-to-br ${currentTheme.gradient} rounded-3xl p-1 shadow-2xl`}
              style={{ 
                boxShadow: `0 20px 60px ${currentTheme.accentColor}40, 0 0 0 1px ${currentTheme.borderColor}`
              }}
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 relative overflow-hidden">
                {/* Decorative Corner Borders - Category Themed */}
                <svg className="absolute top-0 left-0 w-24 h-24" style={{ color: currentTheme.accentColor }}>
                  <path d="M 0 24 Q 0 0 24 0" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M 0 0 L 24 0 M 0 0 L 0 24" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                </svg>
                <svg className="absolute top-0 right-0 w-24 h-24" style={{ color: currentTheme.accentColor }}>
                  <path d="M 24 0 Q 24 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" transform="scale(-1, 1) translate(-24, 0)" />
                  <path d="M 0 0 L 24 0 M 24 0 L 24 24" stroke="currentColor" strokeWidth="1" opacity="0.3" transform="translate(0, 0)" />
                </svg>
                <svg className="absolute bottom-0 left-0 w-24 h-24" style={{ color: currentTheme.accentColor }}>
                  <path d="M 0 0 Q 0 24 24 24" fill="none" stroke="currentColor" strokeWidth="2" transform="translate(0, 0)" />
                  <path d="M 0 0 L 0 24 M 0 24 L 24 24" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                </svg>
                <svg className="absolute bottom-0 right-0 w-24 h-24" style={{ color: currentTheme.accentColor }}>
                  <path d="M 24 24 Q 0 24 0 0" fill="none" stroke="currentColor" strokeWidth="2" transform="translate(0, 0)" />
                  <path d="M 0 24 L 24 24 M 24 0 L 24 24" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                </svg>

                {/* Decorative Elements */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: currentTheme.accentColor }}
                    />
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  {/* Event Type Selection - Premium Card Style */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <ThemeIcon className="w-6 h-6" style={{ color: currentTheme.accentColor }} />
                      <label className="font-display text-2xl" style={{ color: currentTheme.textColor }}>
                        Select Your Celebration
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                      {eventTypes.map((event, index) => {
                        // Get theme for this event, fallback to Other theme if not found
                        const theme = getTheme(event);
                        const EventIcon = theme.icon;
                        return (
                          <motion.button
                            key={event}
                            type="button"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedEvent(event)}
                            className={`group relative px-5 py-3 rounded-full border-2 text-sm font-body transition-all duration-300 flex items-center gap-2 ${
                              selectedEvent === event
                                ? "shadow-lg"
                                : "hover:shadow-md"
                            }`}
                            style={{
                              backgroundColor: selectedEvent === event ? theme.accentColor : "white",
                              borderColor: selectedEvent === event ? theme.accentColor : theme.borderColor,
                              color: selectedEvent === event ? "white" : theme.textColor
                            }}
                          >
                            <EventIcon className="w-4 h-4" />
                            {event}
                            {selectedEvent === event && (
                              <motion.div
                                layoutId="selectedBadge"
                                className="absolute inset-0 rounded-full"
                                style={{ 
                                  border: `2px solid ${theme.accentColor}`,
                                  boxShadow: `0 0 20px ${theme.accentColor}60`
                                }}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Divider with Icon */}
                  <div className="flex items-center justify-center gap-4 py-4">
                    <div className="h-px flex-1" style={{ backgroundColor: currentTheme.borderColor }} />
                    <ThemeIcon className="w-5 h-5" style={{ color: currentTheme.accentColor }} />
                    <div className="h-px flex-1" style={{ backgroundColor: currentTheme.borderColor }} />
                  </div>

                  {/* Form Fields in Card Layout */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <label className="font-body text-sm font-medium mb-3 block flex items-center gap-2" style={{ color: currentTheme.textColor }}>
                        <Users className="w-4 h-4" style={{ color: currentTheme.accentColor }} />
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3.5 rounded-xl border-2 font-body text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-300"
                        style={{
                          borderColor: currentTheme.borderColor,
                          backgroundColor: "rgba(255, 255, 255, 0.5)"
                        }}
                        onFocus={(e) => e.target.style.borderColor = currentTheme.accentColor}
                        onBlur={(e) => e.target.style.borderColor = currentTheme.borderColor}
                        required
                      />
                    </motion.div>

                    {/* City Field */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <label className="font-body text-sm font-medium mb-3 block flex items-center gap-2" style={{ color: currentTheme.textColor }}>
                        <MapPin className="w-4 h-4" style={{ color: currentTheme.accentColor }} />
                        Event City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Event location"
                        className="w-full px-4 py-3.5 rounded-xl border-2 font-body text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-300"
                        style={{
                          borderColor: currentTheme.borderColor,
                          backgroundColor: "rgba(255, 255, 255, 0.5)"
                        }}
                        onFocus={(e) => e.target.style.borderColor = currentTheme.accentColor}
                        onBlur={(e) => e.target.style.borderColor = currentTheme.borderColor}
                        required
                      />
                    </motion.div>
                  </div>

                  {/* Date Field - Full Width */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    <label className="font-body text-sm font-medium mb-3 block flex items-center gap-2" style={{ color: currentTheme.textColor }}>
                      <Calendar className="w-4 h-4" style={{ color: currentTheme.accentColor }} />
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border-2 font-body text-foreground focus:outline-none transition-all duration-300"
                      style={{
                        borderColor: currentTheme.borderColor,
                        backgroundColor: "rgba(255, 255, 255, 0.5)"
                      }}
                      onFocus={(e) => e.target.style.borderColor = currentTheme.accentColor}
                      onBlur={(e) => e.target.style.borderColor = currentTheme.borderColor}
                      required
                    />
                  </motion.div>

                  {/* Message Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <label className="font-body text-sm font-medium mb-3 block" style={{ color: currentTheme.textColor }}>
                      Special Requirements (Optional)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your special day..."
                      rows={4}
                      className="w-full px-4 py-3.5 rounded-xl border-2 font-body text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-300 resize-none"
                      style={{
                        borderColor: currentTheme.borderColor,
                        backgroundColor: "rgba(255, 255, 255, 0.5)"
                      }}
                      onFocus={(e) => e.target.style.borderColor = currentTheme.accentColor}
                      onBlur={(e) => e.target.style.borderColor = currentTheme.borderColor}
                    />
                  </motion.div>

                  {/* Submit Button - Premium Style */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="text-center pt-4"
                  >
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="min-w-[280px] px-8 py-4 rounded-full font-body font-medium text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
                      style={{
                        background: `linear-gradient(135deg, ${currentTheme.accentColor}, ${currentTheme.textColor})`,
                        boxShadow: `0 10px 40px ${currentTheme.accentColor}60`
                      }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      Connect on WhatsApp
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
