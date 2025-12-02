import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      required: true,
    },
    heroSubtitle: {
      type: String,
      required: true,
    },
    heroDescription: {
      type: String,
      required: true,
    },
    heroImage: {
      type: String,
      required: true,
    },
    heroSmallImage1: {
      type: String,
    },
    heroSmallImage2: {
      type: String,
    },
    yearsOfExperience: {
      type: Number,
      required: true,
    },
    happyCustomers: {
      type: Number,
      required: true,
    },
    whyChooseTitle: {
      type: String,
      required: true,
    },
    whyChooseDescription: {
      type: String,
      required: true,
    },
    galleryImages: [
      {
        type: String,
      },
    ],
    ctaTitle: {
      type: String,
      required: true,
    },
    ctaDescription: {
      type: String,
      required: true,
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
