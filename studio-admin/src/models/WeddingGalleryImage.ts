import mongoose, { Document, Model, Schema } from "mongoose";

export interface IWeddingGalleryImage extends Document {
  imageUrl: string;
  imagePublicId: string;
  photoType: "wedding" | "prewedding"; // Only wedding and prewedding
  order: number;
  createdAt: Date;
}

const WeddingGalleryImageSchema = new Schema<IWeddingGalleryImage>(
  {
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    photoType: { 
      type: String, 
      enum: ["wedding", "prewedding"], 
      required: true 
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const WeddingGalleryImage: Model<IWeddingGalleryImage> =
  mongoose.models.WeddingGalleryImage || 
  mongoose.model<IWeddingGalleryImage>("WeddingGalleryImage", WeddingGalleryImageSchema);

export default WeddingGalleryImage;
