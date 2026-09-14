import mongoose, { Schema, Model } from "mongoose";
import { INotification } from "@/types";

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true },
    recipientRole: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user",
    },
    type: {
      type: String,
      enum: [
        "COMMENT_REPLY",
        "COMMENT_APPROVED",
        "COMMENT_REJECTED",
        "MESSAGE_RECEIVED",
        "ADMIN_MESSAGE",
        "SYSTEM",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    link: { type: String, default: "" },
    relatedPostId: { type: Schema.Types.ObjectId, ref: "BlogPost" },
    relatedCommentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    relatedConversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ recipientRole: 1, read: 1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;

