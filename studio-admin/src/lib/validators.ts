import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const mediaSchema = z.object({
  type: z.enum(["image", "video"]),
  category: z.string().min(1),
  url: z.string().url(),
  publicId: z.string().min(1),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isHomepage: z.boolean().default(false),
});

export const storySchema = z.object({
  title: z.string().min(1),
  eventType: z.string().min(1),
  location: z.string().min(1),
  coverImage: z.object({ url: z.string().url(), publicId: z.string() }),
  gallery: z
    .array(
      z.object({ url: z.string().url(), publicId: z.string(), type: z.literal("image") })
    )
    .default([]),
  videos: z
    .array(
      z.object({ url: z.string().url(), publicId: z.string(), type: z.literal("video") })
    )
    .default([]),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  showOnHomepage: z.boolean().default(false),
});

export const reelSchema = z.object({
  title: z.string().min(1),
  videoUrl: z.string().url(),
  publicId: z.string().min(1),
  thumbnail: z.string().optional(),
  showOnHomepage: z.boolean().default(false),
});

export const sectionSchema = z.object({
  key: z.enum(["hero", "editor_pick", "latest"]),
  contentIds: z.array(z.string()).default([]),
  enabled: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const testimonialSchema = z.object({
  clientName: z.string().min(1),
  quote: z.string().min(1),
  image: z.object({ url: z.string().url(), publicId: z.string() }).optional(),
  approved: z.boolean().default(false),
});

export const settingsSchema = z.object({
  heroStoryId: z.string().optional(),
  studioExperience: z.number().int().min(0).default(0),
  weddingsCovered: z.number().int().min(0).default(0),
  citiesServed: z.number().int().min(0).default(0),
});
