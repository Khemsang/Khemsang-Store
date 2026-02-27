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
    // Color Variants with multiple images
    colorVariants: [
      {
        colorName: { type: String, required: true },
        colorCode: { type: String, required: true }, // Hex color code
        images: { 
          type: [String], 
          validate: {
            validator: function(v) {
              return v.length >= 1 && v.length <= 4;
            },
            message: 'Each color variant must have 1-4 images'
          }
        },
        sku: { type: String },
        price: { type: Number }, // Optional price override
        stock: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        // Flash Sale for this variant
        isFlashSale: { type: Boolean, default: false },
        flashDiscountType: { type: String, enum: ["percentage", "flat"] },
        flashDiscountValue: { type: Number, min: 0 },
        flashStartTime: { type: Date },
        flashEndTime: { type: Date },
        flashStock: { type: Number, min: 0 },
      },
    ],
    // Size variants (optional)
    sizes: [{ type: String }],
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
    // Flash Sale Fields
    isFlashSale: {
      type: Boolean,
      default: false,
    },
    flashDiscountType: {
      type: String,
      enum: ["percentage", "flat"],
      default: "percentage",
    },
    flashDiscountValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    flashStartTime: {
      type: Date,
    },
    flashEndTime: {
      type: Date,
    },
    flashStock: {
      type: Number,
      default: 0,
      min: 0,
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
productSchema.index({ isFlashSale: 1, flashEndTime: 1 }); // Flash sales
productSchema.index({ rating: -1 }); // Top rated
// Note: sku index is already created via schema definition (unique: true, sparse: true)

// Virtual field for flash sale price
productSchema.virtual("flashPrice").get(function () {
  if (!this.isFlashSale || !this.isFlashSaleActive()) {
    return null;
  }

  if (this.flashDiscountType === "percentage") {
    return Math.round(this.price * (1 - this.flashDiscountValue / 100));
  } else {
    return Math.max(0, this.price - this.flashDiscountValue);
  }
});

// Method to check if flash sale is currently active
productSchema.methods.isFlashSaleActive = function () {
  if (!this.isFlashSale) return false;
  
  const now = new Date();
  const hasValidTime = this.flashStartTime && this.flashEndTime;
  const isWithinTimeRange = hasValidTime && now >= this.flashStartTime && now <= this.flashEndTime;
  const hasStock = this.flashStock > 0;
  
  return isWithinTimeRange && hasStock;
};

// Method to get effective price (flash or regular)
productSchema.methods.getEffectivePrice = function () {
  const flashPrice = this.flashPrice;
  return flashPrice !== null ? flashPrice : this.price;
};

// Ensure virtuals are included in JSON
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export default mongoose.model("Product", productSchema);
