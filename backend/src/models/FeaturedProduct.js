import mongoose from "mongoose";

const featuredProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false, // Optional - featured products can exist independently
    },
    // Color Variants
    colorVariants: [
      {
        colorName: { type: String, required: true },
        colorCode: { type: String, required: true },
        images: { type: [String], default: [] },
        stock: { type: Number, default: 0 },
        price: { type: Number },
        isActive: { type: Boolean, default: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("FeaturedProduct", featuredProductSchema);
