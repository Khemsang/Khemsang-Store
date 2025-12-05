import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      default: "",
    },
    heroSubtitle: {
      type: String,
      default: "",
    },
    heroDescription: {
      type: String,
      default: "",
    },
    heroImage: {
      type: String,
      default: "",
    },
    heroSmallImage1: {
      type: String,
      default: "",
    },
    heroSmallImage2: {
      type: String,
      default: "",
    },
    yearsOfExperience: {
      type: Number,
      default: 10,
    },
    happyCustomers: {
      type: Number,
      default: 5000,
    },
    whyChooseTitle: {
      type: String,
      default: "",
    },
    whyChooseDescription: {
      type: String,
      default: "",
    },
    galleryImages: [
      {
        type: String,
      },
    ],
    ctaTitle: {
      type: String,
      default: "",
    },
    ctaDescription: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("About", aboutSchema);
