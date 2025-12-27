import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOurStory extends Document {
  imageUrl: string;
  imagePublicId: string;
  startedYear: number;
  description: string;
  updatedAt: Date;
}

const OurStorySchema = new Schema<IOurStory>(
  {
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    startedYear: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const OurStory: Model<IOurStory> =
  mongoose.models.OurStory || mongoose.model<IOurStory>("OurStory", OurStorySchema);

export default OurStory;
