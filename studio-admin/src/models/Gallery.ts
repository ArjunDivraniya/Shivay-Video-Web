import mongoose, { Document, Model, Schema } from "mongoose";

export interface IGallery extends Document {
  imageUrl: string;
  imagePublicId: string;
  category: string;
  createdAt: Date;
}

const GallerySchema = new Schema<IGallery>(
  {
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

const Gallery: Model<IGallery> =
  mongoose.models.Gallery || mongoose.model<IGallery>("Gallery", GallerySchema);

export default Gallery;
