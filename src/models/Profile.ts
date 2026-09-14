import mongoose, { Schema, Model } from "mongoose";
import { IProfile } from "@/types";

const ProfileSchema = new Schema<IProfile>(
  {
    name: { type: String, required: true, trim: true },
    headline: { type: String, required: true, trim: true },
    subheadline: { type: String, default: "" },
    bio: { type: String, default: "" },
    personalStatement: { type: String, default: "" },
    whatIDo: [{ type: String }],
    howIWork: [{ type: String }],
    whatIValue: [{ type: String }],
    avatarUrl: { type: String, default: "" },
    location: { type: String, default: "Remote / Worldwide" },
    availability: {
      status: {
        type: String,
        enum: ["available", "limited", "unavailable"],
        default: "available",
      },
      message: { type: String, default: "Available for select commissions & design engineering" },
    },
    email: { type: String, required: true, trim: true },
    resumeUrl: { type: String, default: "" },
    socialLinks: [
      {
        platform: { type: String, required: true },
        url: { type: String, required: true },
        icon: { type: String, default: "" },
      },
    ],
    currentYear: { type: Number, default: () => new Date().getFullYear() },
  },
  { timestamps: true }
);

export const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);

export default Profile;

