import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SESSION_KEY = "aura-album-intro-played";
const AUTO_TRIGGER_MS = 1200;
const INVITE_FADE_MS = 200;
const SOFT_EASE: [number, number, number, number] = [0.33, 0, 0.2, 1];

interface AlbumIntroOverlayProps {
  isReady: boolean;
}

type Phase = "idle" | "revealing";

const AlbumIntroOverlay = ({ isReady }: AlbumIntroOverlayProps) => {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [isTouch, setIsTouch] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [useFadeOnly, setUseFadeOnly] = useState(false);
  const phaseRef = useRef<Phase>("idle");
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouch(touch);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (event: MediaQueryListEvent) => setPrefersReduced(event.matches);
    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const lowPerf = typeof navigator !== "undefined" && "deviceMemory" in navigator && Number((navigator as any).deviceMemory) <= 4;
    setUseFadeOnly(prefersReduced || lowPerf);
  }, [prefersReduced]);

  const revealDuration = useMemo(() => (useFadeOnly ? 280 : isTouch ? 620 : 700), [useFadeOnly, isTouch]);
  const settleDuration = useMemo(() => (useFadeOnly ? 140 : 220), [useFadeOnly]);

  const markSeen = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch (error) {
      // sessionStorage may be unavailable; fail silently
    }
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  const startReveal = useCallback(() => {
    if (phaseRef.current === "revealing") return;

    markSeen();
    setVisible(true);
    setPhase("revealing");
    phaseRef.current = "revealing";

    const timer = window.setTimeout(() => {
      setVisible(false);
      setPhase("idle");
      phaseRef.current = "idle";
    }, revealDuration + settleDuration + 150);

    timersRef.current.push(timer);
  }, [markSeen, revealDuration, settleDuration]);

  const skipIntro = useCallback(() => {
    markSeen();
    clearTimers();
    setVisible(false);
    setPhase("idle");
    phaseRef.current = "idle";
  }, [markSeen, clearTimers]);

  useEffect(() => {
    if (!isReady) return;

    const alreadySeen = (() => {
      try {
        return sessionStorage.getItem(SESSION_KEY) === "1";
      } catch (error) {
        return false;
      }
    })();

    if (alreadySeen || prefersReduced) {
      markSeen();
      setVisible(false);
      return;
    }

    setVisible(true);

    const autoTimer = window.setTimeout(() => startReveal(), AUTO_TRIGGER_MS);
    timersRef.current.push(autoTimer);

    const trigger = () => startReveal();
    window.addEventListener("scroll", trigger, { once: true, passive: true });
    window.addEventListener("touchstart", trigger, { once: true, passive: true });
    window.addEventListener("keydown", trigger, { once: true });
    window.addEventListener("mousedown", trigger, { once: true });

    return () => {
      clearTimers();
      window.removeEventListener("scroll", trigger);
      window.removeEventListener("touchstart", trigger);
      window.removeEventListener("keydown", trigger);
      window.removeEventListener("mousedown", trigger);
    };
  }, [isReady, prefersReduced, startReveal, markSeen, clearTimers]);

  const coverVariants = useMemo(
    () => ({
      idle: {
        x: "0%",
        opacity: 1,
        transition: { duration: 0.4, ease: SOFT_EASE },
      },
      revealing: useFadeOnly
        ? {
            opacity: 0,
            scale: 0.98,
            transition: { duration: revealDuration / 1000, ease: SOFT_EASE },
          }
        : {
            x: "46%",
            opacity: 0.06,
            transition: { duration: revealDuration / 1000, ease: SOFT_EASE },
          },
    }),
    [revealDuration, useFadeOnly]
  );

  const maskVariants = useMemo(
    () => ({
      idle: {
        clipPath: "inset(0% 0% 0% 0% round 32px)",
        opacity: 0.95,
        transition: { duration: INVITE_FADE_MS / 1000, ease: SOFT_EASE },
      },
      revealing: {
        clipPath: useFadeOnly ? "inset(0% 0% 0% 0% round 32px)" : "inset(0% 100% 0% 0% round 32px)",
        opacity: useFadeOnly ? 0 : 0.7,
        transition: { duration: revealDuration / 1000, ease: SOFT_EASE },
      },
    }),
    [revealDuration, useFadeOnly]
  );

  const veilVariants = useMemo(
    () => ({
      idle: { opacity: 0.7 },
      revealing: {
        opacity: 0,
        transition: { duration: settleDuration / 1000, ease: SOFT_EASE, delay: revealDuration / 1000 - 0.15 },
      },
    }),
    [revealDuration, settleDuration]
  );

  const promptVariants = useMemo(
    () => ({
      idle: { opacity: 0.9, y: 0 },
      revealing: { opacity: 0, y: -6, transition: { duration: INVITE_FADE_MS / 1000 } },
    }),
    []
  );

  const prompt = isTouch ? "Tap to open" : "Scroll to open";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="album-intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: settleDuration / 1000, ease: SOFT_EASE }}
          className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            variants={veilVariants}
            initial="idle"
            animate={phase}
            className="absolute inset-0 bg-gradient-to-br from-[#f8f4eb] via-[#f3ece0] to-[#ece1d0]"
            aria-hidden
          />

          <div className="absolute inset-0 mix-blend-multiply opacity-10 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.08),transparent_38%),radial-gradient(circle_at_80%_0%,rgba(0,0,0,0.06),transparent_32%)]" aria-hidden />

          <button
            onClick={skipIntro}
            className="pointer-events-auto absolute top-6 right-6 text-[11px] tracking-[0.28em] uppercase text-[#6d5d4c] bg-white/70 backdrop-blur-sm border border-[#d8cbb6]/70 rounded-full px-4 py-2 hover:bg-white shadow-sm transition"
            aria-label="Skip intro"
          >
            Skip intro
          </button>

          <div className="relative w-full max-w-5xl px-6 pointer-events-auto">
            <motion.div
              variants={promptVariants}
              initial="idle"
              animate={phase}
              className="absolute -top-12 left-0 right-0 mx-auto w-max text-[11px] md:text-xs tracking-[0.32em] text-[#7a6956] uppercase font-light"
            >
              {prompt} · Begin the story
            </motion.div>

            <div className="relative aspect-[3/2] max-h-[78vh] mx-auto">
              <motion.div
                variants={maskVariants}
                initial="idle"
                animate={phase}
                className="absolute inset-2 md:inset-5 rounded-[28px] bg-[#f6f1e7]/85 backdrop-blur-[1px] shadow-[0_28px_80px_rgba(0,0,0,0.12)]"
                aria-hidden
              />

              <motion.button
                aria-label={prompt}
                onClick={startReveal}
                variants={coverVariants}
                initial="idle"
                animate={phase}
                className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-[#f2ebdc] via-[#ecdfcb] to-[#e6d7c1] border border-white/70 shadow-[0_32px_90px_rgba(0,0,0,0.22)] overflow-hidden text-center"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_42%),radial-gradient(circle_at_75%_10%,rgba(0,0,0,0.05),transparent_36%)]" aria-hidden />
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent via-white/65 to-white/0" aria-hidden />
                <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 px-8">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, ease: SOFT_EASE, delay: 0.1 }}
                    className="text-[#3f3225]"
                  >
                    <p className="text-[10px] md:text-xs tracking-[0.42em] uppercase font-light">Aura Studios</p>
                    <h1 className="mt-3 text-3xl md:text-4xl font-display font-semibold tracking-tight">Wedding Portfolio</h1>
                    <p className="mt-3 text-sm md:text-base text-[#6a5947] italic">A quiet opening to the story</p>
                  </motion.div>

                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#9b846a] to-transparent" />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: phase === "idle" ? 0.65 : 0 }}
                    transition={{ duration: INVITE_FADE_MS / 1000, ease: SOFT_EASE }}
                    className="text-[11px] tracking-[0.32em] uppercase text-[#7a6956]"
                  >
                    {prompt}
                  </motion.div>
                </div>
              </motion.button>

              <div className="absolute -bottom-10 left-10 right-10 h-10 blur-3xl bg-black/10 rounded-full" aria-hidden />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlbumIntroOverlay;
