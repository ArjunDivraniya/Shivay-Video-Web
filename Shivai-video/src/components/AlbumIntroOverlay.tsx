import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

const SESSION_KEY = "aura-album-intro-played";
const INTRO_TOTAL_MS = 1400;
const AUTO_TRIGGER_MS = 1500;
const EASE_CUBIC: [number, number, number, number] = [0.42, 0, 0.58, 1];

interface AlbumIntroOverlayProps {
  isReady: boolean;
}

const AlbumIntroOverlay = ({ isReady }: AlbumIntroOverlayProps) => {
  const [visible, setVisible] = useState(false);
  const [opening, setOpening] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  // Determine motion preference and input type
  useEffect(() => {
    const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouch(touch);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const markSeen = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch (e) {
      // sessionStorage may be unavailable; fail silently
    }
  }, []);

  const startIntro = useCallback(() => {
    if (opening) return;
    setVisible(true);
    setOpening(true);
    markSeen();

    setTimeout(() => {
      setVisible(false);
    }, INTRO_TOTAL_MS);
  }, [markSeen, opening]);

  const skipIntro = useCallback(() => {
    markSeen();
    setOpening(false);
    setVisible(false);
  }, [markSeen]);

  // Setup once-per-session visibility and triggers
  useEffect(() => {
    if (!isReady) return;

    const alreadySeen = (() => {
      try {
        return sessionStorage.getItem(SESSION_KEY) === "1";
      } catch (e) {
        return false;
      }
    })();

    if (alreadySeen || prefersReduced) {
      markSeen();
      setVisible(false);
      return;
    }

    setVisible(true);

    const autoTimer = setTimeout(() => startIntro(), AUTO_TRIGGER_MS);

    const triggerOnce = () => startIntro();
    window.addEventListener("scroll", triggerOnce, { once: true, passive: true });
    window.addEventListener("touchstart", triggerOnce, { once: true, passive: true });
    window.addEventListener("keydown", triggerOnce, { once: true });
    window.addEventListener("mousedown", triggerOnce, { once: true });

    return () => {
      clearTimeout(autoTimer);
      window.removeEventListener("scroll", triggerOnce);
      window.removeEventListener("touchstart", triggerOnce);
      window.removeEventListener("keydown", triggerOnce);
      window.removeEventListener("mousedown", triggerOnce);
    };
  }, [isReady, prefersReduced, startIntro, markSeen]);

  const coverVariants = useMemo(
    () => ({
      closed: { 
        rotateY: 0, 
        x: "0%",
        opacity: 1,
        transition: { duration: 0.5, ease: EASE_CUBIC }
      },
      opening: {
        rotateY: -95,
        x: "-45%",
        opacity: 0.3,
        transition: { duration: 0.85, ease: EASE_CUBIC },
      },
    }),
    []
  );

  const pageRevealVariants = useMemo(
    () => ({
      hidden: { 
        opacity: 0, 
        scale: 0.95,
        transition: { duration: 0.3, ease: EASE_CUBIC }
      },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: EASE_CUBIC, delay: 0.2 },
      },
    }),
    []
  );

  const heroFadeVariants = useMemo(
    () => ({
      hidden: { 
        opacity: 0,
        transition: { duration: 0.2, ease: EASE_CUBIC }
      },
      visible: {
        opacity: 1,
        transition: { duration: 0.4, ease: EASE_CUBIC, delay: 0.5 },
      },
    }),
    []
  );

  const prompt = isTouch ? "Tap to open our story" : "Scroll to begin";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#f8f5ef] text-charcoal"
        >
          {/* Ambient backdrop */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f3eee3] via-[#f7f2e9] to-[#efe7d8]" />
            <div className="absolute inset-0 mix-blend-multiply opacity-[0.08] bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(0,0,0,0.05),transparent_32%)]" />
          </div>

          {/* Skip */}
          <button
            onClick={skipIntro}
            className="absolute top-6 right-6 text-xs tracking-[0.2em] uppercase text-[#6b5b4b] bg-white/60 backdrop-blur-sm border border-[#d9cbb4]/60 rounded-full px-4 py-2 hover:bg-white shadow-sm transition"
            aria-label="Skip intro"
          >
            Skip intro
          </button>

          <div className="relative w-full max-w-5xl px-6" style={{ perspective: "2000px", perspectiveOrigin: "center center" }}>
            {/* Prompt */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: opening ? 0 : 0.9, y: opening ? -6 : 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute -top-12 left-0 right-0 mx-auto w-max text-[11px] md:text-xs tracking-[0.32em] text-[#7a6956] uppercase font-light z-10"
            >
              {prompt}
            </motion.div>

            <div className="relative aspect-[3/2] max-h-[78vh] mx-auto">
              {/* Inner page that becomes the hero reveal */}
              <motion.div
                variants={pageRevealVariants}
                initial="hidden"
                animate={opening ? "visible" : "hidden"}
                className="absolute inset-3 md:inset-6 rounded-[24px] bg-gradient-to-br from-white via-[#f8f4ec] to-[#efe7d9] shadow-[0_25px_80px_rgba(0,0,0,0.08)] overflow-hidden z-10"
              >
                <motion.div
                  variants={heroFadeVariants}
                  initial="hidden"
                  animate={opening ? "visible" : "hidden"}
                  className="absolute inset-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/0 to-black/25" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.07),transparent_32%),radial-gradient(circle_at_70%_10%,rgba(0,0,0,0.05),transparent_28%)] opacity-30" />
                </motion.div>

                {/* Minimal interior text */}
                <div className="absolute left-0 right-0 top-10 md:top-14 text-center text-[#514433]">
                  <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase font-light">Wedding Portfolio</p>
                  <p className="mt-2 text-xl md:text-2xl font-display italic text-[#3e3226]">The day their story began</p>
                </div>
              </motion.div>

              {/* Album cover */}
              <motion.button
                aria-label={prompt}
                onClick={startIntro}
                variants={coverVariants}
                initial="closed"
                animate={opening ? "opening" : "closed"}
                className="absolute inset-0 rounded-[28px] md:rounded-[32px] bg-gradient-to-br from-[#f2eadb] via-[#ede2d0] to-[#e5d6bf] border border-white/60 shadow-[0_28px_70px_rgba(0,0,0,0.28)] overflow-hidden origin-left z-20"
                style={{ 
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden"
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(0,0,0,0.05),transparent_36%)]" />
                <div className="absolute inset-0" aria-hidden>
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.05)_35%,rgba(0,0,0,0.04)_100%)]" />
                  <div className="absolute inset-0 opacity-50 mix-blend-multiply bg-[radial-gradient(circle_at_20%_30%,rgba(0,0,0,0.08),transparent_35%)]" />
                </div>
                <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-center px-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-[#403225]"
                  >
                    <p className="text-[10px] md:text-xs tracking-[0.42em] uppercase font-light mb-3">Aura Studios</p>
                    <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">Wedding Album</h1>
                    <p className="mt-3 text-sm md:text-base text-[#6a5a48] italic">Opening the pages of their forever</p>
                  </motion.div>

                  <div className="mt-6 h-px w-24 bg-gradient-to-r from-transparent via-[#9b846a] to-transparent" />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: opening ? 0 : 0.65 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 text-[11px] tracking-[0.32em] uppercase text-[#7a6956]"
                  >
                    {prompt}
                  </motion.div>
                </div>
              </motion.button>

              {/* Subtle desk shadow */}
              <div className="absolute -bottom-10 left-8 right-8 h-10 blur-3xl bg-black/10 rounded-full" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlbumIntroOverlay;
