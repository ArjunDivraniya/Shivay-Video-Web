import { motion } from "framer-motion";
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from "lucide-react";

const FooterSection = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-charcoal py-16 overflow-hidden">
      {/* Subtle Pattern */}
      <div className="absolute inset-0 pattern-overlay opacity-5" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          {/* Logo */}
          <h3 className="font-display text-3xl md:text-4xl text-ivory mb-2">
            <span className="text-gold-gradient">Aura</span> Studios
          </h3>
          <p className="font-body text-ivory/60 text-sm italic">
            Capturing emotions, one frame at a time
          </p>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-8 mb-12 text-ivory/70"
        >
          <a
            href="#"
            className="flex items-center gap-2 font-body text-sm hover:text-gold transition-colors"
          >
            <MapPin className="w-4 h-4 text-gold" />
            Junagadh, Gujarat
          </a>
          <a
            href="tel:+919876543210"
            className="flex items-center gap-2 font-body text-sm hover:text-gold transition-colors"
          >
            <Phone className="w-4 h-4 text-gold" />
            +91 98765 43210
          </a>
          <a
            href="mailto:hello@aurastudios.in"
            className="flex items-center gap-2 font-body text-sm hover:text-gold transition-colors"
          >
            <Mail className="w-4 h-4 text-gold" />
            hello@aurastudios.in
          </a>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center gap-4 mb-12"
        >
          {[
            { icon: Instagram, href: "#", label: "Instagram" },
            { icon: Facebook, href: "#", label: "Facebook" },
            { icon: Youtube, href: "#", label: "YouTube" },
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-ivory/70 hover:bg-gold/10 hover:text-gold hover:border-gold transition-all"
            >
              <social.icon className="w-5 h-5" />
            </a>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="w-24 h-px bg-gold/30 mx-auto mb-8" />

        {/* Copyright */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center font-body text-ivory/40 text-sm"
        >
          © {currentYear} Aura Studios. All rights reserved.
        </motion.p>
      </div>
    </footer>
  );
};

export default FooterSection;
