import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReview extends Document {
  coupleName: string;
  review: string;
  place: string;
  serviceType: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    coupleName: { type: String, required: true },
    review: { type: String, required: true },
    place: { type: String, required: true },
    serviceType: { type: String, required: true },
  },
  { timestamps: true }
);

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
