import mongoose, { Schema, models, model } from "mongoose";

const TestimonialSchema = new Schema(
  {
    clientName: { type: String, required: true },
    quote: { type: String, required: true },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TestimonialSchema.index({ approved: 1 });
TestimonialSchema.index({ createdAt: -1 });

const Testimonial = models.Testimonial || model("Testimonial", TestimonialSchema);
export default Testimonial;
