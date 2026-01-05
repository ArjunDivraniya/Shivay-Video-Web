"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { apiService, GalleryImage as ApiGalleryImage } from "@/services/api";

type GalleryImage = ApiGalleryImage & { categoryKey?: string };

type SlotConfig = {
  id: string;
  span: string;
  category: string;
};

type SlotState = {
  slotId: string;
  image: GalleryImage | null;
  version: number;
};

const SLOT_CONFIG: SlotConfig[] = [
  { id: "slot-1", span: "col-span-2 row-span-2", category: "wedding" },
  { id: "slot-2", span: "col-span-1 row-span-1", category: "wedding" },
  { id: "slot-3", span: "col-span-2 row-span-1", category: "ceremony" },
  { id: "slot-4", span: "col-span-1 row-span-2", category: "portrait" },
  { id: "slot-5", span: "col-span-1 row-span-1", category: "prewedding" },
  { id: "slot-6", span: "col-span-1 row-span-1", category: "wedding" },
  { id: "slot-7", span: "col-span-2 row-span-1", category: "ceremony" },
  { id: "slot-8", span: "col-span-1 row-span-2", category: "portrait" },
];

const FALLBACK_IMAGE: GalleryImage = {
  _id: "placeholder",
  src: "https://images.unsplash.com/photo-1520854221050-0f4caff449fb?w=900&q=80",
  alt: "Gallery image",
  category: "wedding",
  categoryKey: "wedding",
};

const CATEGORY_ALIASES: Record<string, string> = {
  wedding: "wedding",
  "wedding film": "wedding",
  "wedding story": "wedding",
  prewedding: "prewedding",
  "pre-wedding": "prewedding",
  couple: "prewedding",
  ceremony: "ceremony",
  ritual: "ceremony",
  portrait: "portrait",
};

const GallerySection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });
  const [slotImages, setSlotImages] = useState<SlotState[]>([]);
  const [pools, setPools] = useState<Record<string, GalleryImage[]>>({});
  const prefersReducedMotion = useReducedMotion();
  const isVisible = useInView(sectionRef, { margin: "-20%" });

  const isMobile = typeof window !== "undefined" && window.matchMedia('(max-width: 768px)').matches;

  const normalizeCategory = (value?: string) => {
    const key = (value || "wedding").trim().toLowerCase();
    return CATEGORY_ALIASES[key] || key || "wedding";
  };

  const pickImage = (
    category: string,
    currentIds: Set<string>,
    poolMap: Record<string, GalleryImage[]>
  ): GalleryImage => {
    const pool = poolMap[category]?.filter((img) => !currentIds.has(img._id)) || [];
    if (pool.length) return pool[Math.floor(Math.random() * pool.length)];

    const any = Object.values(poolMap).flat().filter((img) => !currentIds.has(img._id));
    if (any.length) return any[Math.floor(Math.random() * any.length)];

    return FALLBACK_IMAGE;
  };

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        let data = await apiService.getHighlightGallery();
        if (!data?.length) {
          data = await apiService.getGallery();
        }
        const normalized: GalleryImage[] = data.map((img, index) => ({
          ...img,
          _id: img._id || `gallery-${index}`,
          alt: img.alt || img.category || "Gallery image",
          categoryKey: normalizeCategory(img.category || img.serviceType),
        }));

        const grouped = normalized.reduce<Record<string, GalleryImage[]>>((acc, img) => {
          const key = img.categoryKey || "wedding";
          if (!acc[key]) acc[key] = [];
          acc[key].push(img);
          return acc;
        }, {});

        setPools(grouped);

        const currentIds = new Set<string>();
        const initialSlots: SlotState[] = SLOT_CONFIG.map((slot, idx) => {
          const chosen = pickImage(slot.category, currentIds, grouped);
          currentIds.add(chosen._id);
          return { slotId: slot.id, image: chosen, version: idx };
        });
        setSlotImages(initialSlots);
      } catch (error) {
        console.error("Failed to load gallery", error);
        const fallbackSlots = SLOT_CONFIG.map((slot, idx) => ({
          slotId: slot.id,
          image: FALLBACK_IMAGE,
          version: idx,
        }));
        setSlotImages(fallbackSlots);
      }
    };

    fetchGallery();
  }, []);

  useEffect(() => {
    if (!slotImages.length) return;
    if (!isVisible) return;

    let timer: NodeJS.Timeout | null = null;

    const scheduleSwap = () => {
      const baseMin = prefersReducedMotion ? 10000 : 8000;
      const baseMax = prefersReducedMotion ? 12000 : 12000;
      const delay = isMobile ? 12000 : Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;

      timer = setTimeout(() => {
        setSlotImages((prev) => {
          if (!prev.length) return prev;

          const targetIndex = Math.floor(Math.random() * prev.length);
          const slot = SLOT_CONFIG[targetIndex];
          const currentIds = new Set(prev.map((s) => s.image?._id).filter(Boolean) as string[]);
          const nextImg = pickImage(slot.category, currentIds, pools);

          const next = [...prev];
          next[targetIndex] = {
            ...next[targetIndex],
            image: nextImg,
            version: next[targetIndex].version + 1,
          };
          return next;
        });

        scheduleSwap();
      }, delay);
    };

    scheduleSwap();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [slotImages.length, pools, prefersReducedMotion, isVisible, isMobile]);

  const isEmpty = useMemo(() => slotImages.every((s) => !s.image), [slotImages]);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 bg-ivory overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header (unchanged) */}
        <div
          ref={headerRef}
          className={`text-center mb-16 transition-opacity duration-700 ${isHeaderInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <span className="text-sm tracking-widest-xl text-primary uppercase font-body mb-4 block">
            Editor's Choice
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-4">
            Highlight <span className="text-gold-gradient">Gallery</span>
          </h2>
          <p className="font-body text-charcoal-light max-w-xl mx-auto">
            Curated moments that tell stories of love, joy, and celebration
          </p>
        </div>

        {/* Static Grid; only images swap */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {slotImages.map((slot, index) => {
            const config = SLOT_CONFIG[index];
            const image = slot.image || FALLBACK_IMAGE;
            return (
              <div
                key={slot.slotId}
                className={`relative overflow-hidden rounded-sm bg-charcoal/5 ${config.span}`}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${image._id}-${slot.version}`}
                    src={image.src || FALLBACK_IMAGE.src}
                    alt={image.alt}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.02 }}
                    transition={{ duration: prefersReducedMotion ? 0.35 : 0.5, ease: "easeInOut" }}
                  />
                </AnimatePresence>
              </div>
            );
          })}

          {isEmpty && (
            <div className="col-span-2 md:col-span-3 lg:col-span-4 h-[200px] rounded-sm bg-charcoal/5 flex items-center justify-center text-charcoal-light">
              Loading gallery…
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
