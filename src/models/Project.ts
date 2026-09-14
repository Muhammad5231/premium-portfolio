import mongoose, { Schema, Model } from "mongoose";
import { IProject } from "@/types";

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    year: { type: Schema.Types.Mixed, default: () => new Date().getFullYear() },
    client: { type: String, default: "" },
    role: { type: String, required: true, trim: true },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["published", "draft", "archived"],
      default: "draft",
    },
    thumbnail: { type: String, required: true },
    heroMedia: { type: String, default: "" },
    gallery: [{ type: String }],
    videoUrl: { type: String, default: "" },
    liveUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    challenge: { type: String, default: "" },
    approach: { type: String, default: "" },
    solution: { type: String, default: "" },
    results: { type: String, default: "" },
    technologies: [{ type: String, trim: true }],
    order: { type: Number, default: 0 },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

ProjectSchema.index({ status: 1, order: 1 });
ProjectSchema.index({ featured: 1, status: 1 });

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;

