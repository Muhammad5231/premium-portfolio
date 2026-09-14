import mongoose, { Schema, Model } from "mongoose";
import { IBlogPost } from "@/types";

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: "", trim: true },
    author: {
      name: { type: String, required: true, default: "Mohammad" },
      avatar: { type: String, default: "" },
    },
    category: { type: String, required: true, default: "Architecture" },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["published", "draft", "archived", "scheduled"],
      default: "draft",
    },
    featured: { type: Boolean, default: false },
    readingTime: { type: Number, default: 4 },
    publishedAt: { type: Date, default: Date.now },
    scheduledAt: { type: Date },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    order: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ category: 1 });
BlogPostSchema.index({ featured: 1 });

export const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);

export default BlogPost;

