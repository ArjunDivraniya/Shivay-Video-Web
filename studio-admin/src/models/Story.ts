import mongoose, { Schema, models, model } from "mongoose";

const MediaItemSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], required: true },
  },
  { _id: false }
);

const StorySchema = new Schema(
  {
    title: { type: String, required: true },
    eventType: { type: String, required: true },
    location: { type: String, required: true },
    coverImage: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    gallery: { type: [MediaItemSchema], default: [] },
    videos: { type: [MediaItemSchema], default: [] },
    tags: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    showOnHomepage: { type: Boolean, default: false },
  },
  { timestamps: true }
);

StorySchema.index({ createdAt: -1 });
StorySchema.index({ isFeatured: 1 });
StorySchema.index({ showOnHomepage: 1 });

const Story = models.Story || model("Story", StorySchema);
export default Story;
