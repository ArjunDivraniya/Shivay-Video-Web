import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFooter extends Document {
  phone: string;
  email: string;
  instagram: string;
  youtube: string;
  facebook: string;
  createdAt: Date;
  updatedAt: Date;
}

const FooterSchema = new Schema<IFooter>(
  {
    phone: { type: String, required: true, default: "" },
    email: { type: String, required: true, default: "" },
    instagram: { type: String, default: "" },
    youtube: { type: String, default: "" },
    facebook: { type: String, default: "" },
  },
  { timestamps: true }
);

const Footer: Model<IFooter> =
  mongoose.models.Footer || mongoose.model<IFooter>("Footer", FooterSchema);

export default Footer;
