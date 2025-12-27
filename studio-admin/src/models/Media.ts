import mongoose, { Schema, models, model } from "mongoose";

const MediaSchema = new Schema(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    category: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    thumbnail: { type: String },
    tags: { type: [String], default: [] },
    isHomepage: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MediaSchema.index({ createdAt: -1 });
MediaSchema.index({ isHomepage: 1 });

const Media = models.Media || model("Media", MediaSchema);
export default Media;
