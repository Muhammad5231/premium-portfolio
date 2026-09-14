import mongoose, { Schema, Model } from "mongoose";
import { ISiteSettings } from "@/types";

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: { type: String, default: "Studio Portfolio" },
    logoText: { type: String, default: "PORTFOLIO" },
    contactEmail: { type: String, default: "hello@domain.com" },
    seoTitle: { type: String, default: "Creative Developer & System Architect" },
    seoDescription: {
      type: String,
      default: "Bespoke digital experiences, creative engineering, and high-craft software systems.",
    },
    keywords: [{ type: String }],
    ogImage: { type: String, default: "" },
    footerStatement: {
      type: String,
      default: "Crafting digital identities, scalable architectures, and memorable interactive experiences.",
    },
    copyrightText: {
      type: String,
      default: "All rights reserved.",
    },
    maintenanceMode: { type: Boolean, default: false },
    analyticsId: { type: String, default: "" },
  },
  { timestamps: true }
);

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;

