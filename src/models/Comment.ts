import mongoose, { Schema, Model } from "mongoose";
import { IComment } from "@/types";

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "BlogPost", required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "deleted"],
      default: "pending",
    },
    isAdminReply: { type: Boolean, default: false },
    adminAuthorName: { type: String, default: "" },
  },
  { timestamps: true }
);

CommentSchema.index({ postId: 1, status: 1, createdAt: 1 });
CommentSchema.index({ parentId: 1 });
CommentSchema.index({ userId: 1 });

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;

