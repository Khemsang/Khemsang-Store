import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: false,
      trim: true,
      default: "Customer",
    },
    imageUrl: {
      type: String,
      required: false,
      default: "https://ui-avatars.com/api/?name=User&background=random",
    },
    quote: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true, // Auto-approve user testimonials
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Testimonial", testimonialSchema);
