import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
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
    shortDescription: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    images: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    // Product Specifications
    specifications: {
      weight: { type: String },
      dimensions: { type: String },
      material: { type: String },
      color: { type: String },
      size: { type: String },
    },
    // Additional Details
    features: [{ type: String }],
    tags: [{ type: String }],
    // Variants (e.g., different colors/sizes)
    variants: [
      {
        name: { type: String },
        value: { type: String },
        price: { type: Number },
        stock: { type: Number },
        image: { type: String },
      },
    ],
    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    // Ratings
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    // Shipping
    freeShipping: {
      type: Boolean,
      default: false,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    // Warranty
    warranty: {
      type: String,
    },
    // Return Policy
    returnPolicy: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
productSchema.index({ title: "text", description: "text", tags: "text" });

export default mongoose.model("Product", productSchema);
