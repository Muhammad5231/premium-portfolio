import mongoose, { Schema, Model } from "mongoose";
import { IGalleryItem } from "@/types";

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "", trim: true },
    image: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, default: "Design & Engineering" },
    tags: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

GalleryItemSchema.index({ published: 1, order: 1 });
GalleryItemSchema.index({ category: 1 });

export const GalleryItem: Model<IGalleryItem> =
  mongoose.models.GalleryItem ||
  mongoose.model<IGalleryItem>("GalleryItem", GalleryItemSchema);

export default GalleryItem;
