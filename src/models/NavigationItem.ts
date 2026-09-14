import mongoose, { Schema, Model } from "mongoose";
import { INavigationItem } from "@/types";

const NavigationItemSchema = new Schema<INavigationItem>(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
    isExternal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NavigationItemSchema.index({ visible: 1, order: 1 });

export const NavigationItem: Model<INavigationItem> =
  mongoose.models.NavigationItem ||
  mongoose.model<INavigationItem>("NavigationItem", NavigationItemSchema);

export default NavigationItem;

