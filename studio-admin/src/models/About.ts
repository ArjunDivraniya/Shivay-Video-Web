import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAbout extends Document {
  experienceYears: number;
  weddingsCompleted: number;
  destinations: number;
  happyCouples: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AboutSchema = new Schema<IAbout>(
  {
    experienceYears: { type: Number, required: true, default: 0 },
    weddingsCompleted: { type: Number, required: true, default: 0 },
    destinations: { type: Number, required: true, default: 0 },
    happyCouples: { type: Number, required: true, default: 0 },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

const About: Model<IAbout> =
  mongoose.models.About || mongoose.model<IAbout>("About", AboutSchema);

export default About;
