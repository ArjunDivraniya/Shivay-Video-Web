import mongoose, { Schema, models, model } from "mongoose";

const ReelSchema = new Schema(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    thumbnail: { type: String },
    showOnHomepage: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReelSchema.index({ createdAt: -1 });
ReelSchema.index({ showOnHomepage: 1 });

const Reel = models.Reel || model("Reel", ReelSchema);
export default Reel;
