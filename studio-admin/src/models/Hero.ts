import mongoose, { Document, Model, Schema } from "mongoose";

export interface IHero extends Document {
  imageUrl: string;
  imagePublicId: string;
  mobileImageUrl?: string;
  mobileImagePublicId?: string;
  title?: string;
  subtitle?: string;
  location?: string;
  styles?: {
    textColor: string;
    studioNameColor?: string;
    locationColor?: string;
    taglineColor?: string;
    overlayOpacity: number;
    justifyContent: "flex-start" | "flex-center" | "flex-end";
    alignItems: "flex-start" | "flex-center" | "flex-end";
    verticalSpacing: number;
  };
  updatedAt: Date;
}

const HeroSchema = new Schema<IHero>(
  {
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    mobileImageUrl: { type: String },
    mobileImagePublicId: { type: String },
    title: { type: String, default: "Shivay Video" },
    subtitle: { type: String, default: "Where emotions become timeless frames" },
    location: { type: String, default: "Junagadh • Gujarat" },
    styles: {
      textColor: { type: String, default: "#ffffff" },
      studioNameColor: { type: String, default: "#ffffff" },
      locationColor: { type: String, default: "#ffffff" },
      taglineColor: { type: String, default: "#ffffff" },
      overlayOpacity: { type: Number, default: 0.5, min: 0, max: 0.9 },
      justifyContent: { type: String, default: "flex-center" },
      alignItems: { type: String, default: "flex-center" },
      verticalSpacing: { type: Number, default: 0, min: -100, max: 100 },
    },
  },
  { timestamps: true }
);

const Hero: Model<IHero> =
  mongoose.models.Hero || mongoose.model<IHero>("Hero", HeroSchema);

export default Hero;
