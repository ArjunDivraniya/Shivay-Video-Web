import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Minimum display time for the preloader
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); // Wait for exit animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-charcoal flex items-center justify-center overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 pattern-overlay opacity-5" />
          
          {/* Animated circles */}
          <motion.div
            className="absolute w-[600px] h-[600px] border border-gold/10 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] border border-gold/20 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          />
          <motion.div
            className="absolute w-[200px] h-[200px] border border-gold/30 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
          />
          
          {/* Logo container */}
          <div className="relative z-10 text-center">
            {/* Logo text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-6"
            >
              <motion.h1 
                className="font-display text-5xl md:text-6xl text-ivory font-semibold"
                initial={{ letterSpacing: "0.5em", opacity: 0 }}
                animate={{ letterSpacing: "0.05em", opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <span className="text-gold-gradient">Aura</span>
                <motion.span
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  {" "}Studios
                </motion.span>
              </motion.h1>
            </motion.div>
            
            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="font-display text-lg text-ivory/60 italic"
            >
              Where emotions become timeless frames
            </motion.p>
            
            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-12 flex items-center justify-center gap-3"
            >
              <motion.div
                className="w-2 h-2 bg-gold rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-gold rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-gold rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </motion.div>
          </div>
          
          {/* Gold line reveal at bottom */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-gradient-gold"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
