import mongoose, { Schema, Model } from "mongoose";
import { IConversationMessage } from "@/types";

const ConversationMessageSchema = new Schema<IConversationMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderRole: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    content: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ConversationMessageSchema.index({ conversationId: 1, createdAt: 1 });

export const ConversationMessage: Model<IConversationMessage> =
  mongoose.models.ConversationMessage ||
  mongoose.model<IConversationMessage>(
    "ConversationMessage",
    ConversationMessageSchema
  );

export default ConversationMessage;

