import mongoose from "mongoose";

const contactSettingsSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    workingHours: {
      type: String,
      default: "Mon - Fri: 9:00 AM - 6:00 PM",
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
    },
    mapUrl: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ContactSettings", contactSettingsSchema);
