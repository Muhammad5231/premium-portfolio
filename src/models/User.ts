import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "@/types";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 500 },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    notificationPreferences: {
      emailNotifications: { type: Boolean, default: true },
      commentReplies: { type: Boolean, default: true },
      adminMessages: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

UserSchema.index({ status: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

