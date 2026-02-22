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
        color: { type: String, required: true },
        size: { type: String },
        sku: { type: String },
        price: { type: Number },
        stock: { type: Number, default: 0 },
        images: [{ type: String }],
        isActive: { type: Boolean, default: true },
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

// Indexes for better query performance
productSchema.index({ title: "text", description: "text", tags: "text" }); // Text search
productSchema.index({ category: 1, isActive: 1 }); // Category filtering
productSchema.index({ price: 1 }); // Price sorting
productSchema.index({ createdAt: -1 }); // Latest products
productSchema.index({ isFeatured: 1, isActive: 1 }); // Featured products
productSchema.index({ isBestSeller: 1, isActive: 1 }); // Best sellers
productSchema.index({ isNewArrival: 1, isActive: 1 }); // New arrivals
productSchema.index({ rating: -1 }); // Top rated
// Note: sku index is already created via schema definition (unique: true, sparse: true)

export default mongoose.model("Product", productSchema);
