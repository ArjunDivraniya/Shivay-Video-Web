import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar, MapPin, PartyPopper } from "lucide-react";

const eventTypes = [
  "Wedding",
  "Pre-Wedding",
  "Engagement",
  "Haldi",
  "Mehndi",
  "Sangeet",
  "Birthday",
  "Corporate Event",
  "Other",
];

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedEvent, setSelectedEvent] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    date: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hi! I'm ${formData.name} from ${formData.city}. I'm interested in ${selectedEvent} photography for ${formData.date}. ${formData.message}`;
    const whatsappUrl = `https://wa.me/919106572374?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pattern-overlay opacity-30" />

      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <span className="text-sm tracking-widest-xl text-primary uppercase font-body mb-4 block">
              Get In Touch
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Book Your <span className="text-gold-gradient">Date</span>
            </h2>
            <p className="font-body text-muted-foreground max-w-xl mx-auto">
              Let's create something beautiful together
            </p>
          </motion.div>

          {/* Contact Form - Wedding Invitation Style */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: -10 }}
            animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-card rounded-sm border border-border p-8 md:p-12 shadow-elevated relative overflow-hidden">
              {/* Gold Corners */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-gold" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-gold" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-gold" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-gold" />

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Type */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <label className="flex items-center gap-2 font-body text-sm text-foreground mb-3">
                    <PartyPopper className="w-4 h-4 text-primary" />
                    Event Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {eventTypes.map((event) => (
                      <button
                        key={event}
                        type="button"
                        onClick={() => setSelectedEvent(event)}
                        className={`px-4 py-2 rounded-full border text-sm font-body transition-all ${
                          selectedEvent === event
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                        }`}
                      >
                        {event}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Name & City */}
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <label className="font-body text-sm text-foreground mb-2 block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <label className="flex items-center gap-2 font-body text-sm text-foreground mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Event location"
                      className="w-full px-4 py-3 bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </motion.div>
                </div>

                {/* Date */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <label className="flex items-center gap-2 font-body text-sm text-foreground mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-sm font-body text-foreground focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </motion.div>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <label className="font-body text-sm text-foreground mb-2 block">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your event..."
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-center pt-4"
                >
                  <Button type="submit" variant="whatsapp" size="xl" className="min-w-[250px]">
                    <MessageCircle className="w-5 h-5" />
                    Connect on WhatsApp
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
