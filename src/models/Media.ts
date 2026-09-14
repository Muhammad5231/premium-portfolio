import mongoose, { Schema, Model } from "mongoose";
import { IMedia } from "@/types";

const MediaSchema = new Schema<IMedia>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
    },
  },
  { timestamps: true }
);

MediaSchema.index({ createdAt: -1 });

export const Media: Model<IMedia> =
  mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);

export default Media;

