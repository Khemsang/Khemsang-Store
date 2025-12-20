import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "E-Commerce Store",
    },
    logo: {
      type: String,
      default: "",
    },
    favicon: {
      type: String,
      default: "",
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: "Site is under maintenance. Please check back later.",
    },
    // Financial Settings
    commissionRate: {
      type: Number,
      default: 10, // 10%
    },
    taxRate: {
      type: Number,
      default: 13, // 13% VAT
    },
    deliveryCharge: {
      type: Number,
      default: 100,
    },
    freeDeliveryMinimum: {
      type: Number,
      default: 2000,
    },
    // Contact Info
    contactEmail: {
      type: String,
      default: "",
    },
    contactPhone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    // Social Links
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    // SEO
    metaTitle: {
      type: String,
      default: "",
    },
    metaDescription: {
      type: String,
      default: "",
    },
    // Currency
    currency: {
      type: String,
      default: "NPR",
    },
    currencySymbol: {
      type: String,
      default: "Rs.",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SiteSettings", siteSettingsSchema);
