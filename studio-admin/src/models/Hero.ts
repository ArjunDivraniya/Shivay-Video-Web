import mongoose, { Document, Model, Schema } from "mongoose";

export interface IHero extends Document {
  imageUrl: string;
  imagePublicId: string;
  updatedAt: Date;
}

const HeroSchema = new Schema<IHero>(
  {
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
  },
  { timestamps: true }
);

const Hero: Model<IHero> =
  mongoose.models.Hero || mongoose.model<IHero>("Hero", HeroSchema);

export default Hero;
