import mongoose, { Document, Model, Schema } from "mongoose";

export interface IWeddingStory extends Document {
  title: string;
  coupleName: string;
  place: string;
  coverPhoto: {
    url: string;
    publicId: string;
  };
  gallery: string[];
  createdAt: Date;
}

const WeddingStorySchema = new Schema<IWeddingStory>(
  {
    title: { type: String, required: true },
    coupleName: { type: String, required: true },
    place: { type: String, required: true },
    coverPhoto: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    gallery: { type: [String], default: [] },
  },
  { timestamps: true }
);

const WeddingStory: Model<IWeddingStory> =
  mongoose.models.WeddingStory || mongoose.model<IWeddingStory>("WeddingStory", WeddingStorySchema);

export default WeddingStory;
