import mongoose, { Schema, models, model } from "mongoose";

const SectionSchema = new Schema(
  {
    key: { type: String, enum: ["hero", "editor_pick", "latest"], unique: true },
    contentIds: [{ type: Schema.Types.ObjectId }],
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SectionSchema.index({ key: 1 });
SectionSchema.index({ order: 1 });

const Section = models.Section || model("Section", SectionSchema);
export default Section;
