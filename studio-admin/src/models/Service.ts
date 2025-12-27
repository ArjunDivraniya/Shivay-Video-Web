import mongoose, { Document, Model, Schema } from "mongoose";

export interface IService extends Document {
  serviceName: string;
  serviceType: string;
  imageUrl: string;
  imagePublicId: string;
  isActive: boolean;
  createdAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    serviceName: { type: String, required: true },
    serviceType: { 
      type: String, 
      required: true,
      enum: ["Wedding", "Corporate", "Party", "Other"]
    },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);

export default Service;
