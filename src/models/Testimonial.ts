import mongoose, { Schema, Model } from "mongoose";
import { ITestimonial } from "@/types";

const TestimonialSchema = new Schema<ITestimonial>(
  {
    person: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    quote: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    companyLogo: { type: String, default: "" },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TestimonialSchema.index({ visible: 1, order: 1 });

export const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial || mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);

export default Testimonial;

