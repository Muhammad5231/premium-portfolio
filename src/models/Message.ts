import mongoose, { Schema, Model } from "mongoose";
import { IMessage } from "@/types";

const MessageSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, default: "Inquiry" },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["unread", "read", "archived"],
      default: "unread",
    },
    ipAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

MessageSchema.index({ status: 1, createdAt: -1 });

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;

