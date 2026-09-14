import mongoose, { Schema, Model } from "mongoose";
import { ICapability } from "@/types";

const CapabilitySchema = new Schema<ICapability>(
  {
    category: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    items: [
      {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        tags: [{ type: String, trim: true }],
      },
    ],
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CapabilitySchema.index({ visible: 1, order: 1 });

export const Capability: Model<ICapability> =
  mongoose.models.Capability || mongoose.model<ICapability>("Capability", CapabilitySchema);

export default Capability;

