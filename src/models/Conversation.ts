import mongoose, { Schema, Model } from "mongoose";
import { IConversation } from "@/types";

const ConversationSchema = new Schema<IConversation>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true, default: "Inquiry" },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "ARCHIVED"],
      default: "OPEN",
    },
    lastMessageAt: { type: Date, default: Date.now },
    unreadByUser: { type: Boolean, default: false },
    unreadByAdmin: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ConversationSchema.index({ user: 1, lastMessageAt: -1 });
ConversationSchema.index({ status: 1, lastMessageAt: -1 });
ConversationSchema.index({ unreadByAdmin: 1 });

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;

