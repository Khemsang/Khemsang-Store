import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        // Color variant information
        colorVariant: {
          colorName: String,
          colorCode: String,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: "esewa",
    },
    transactionId: {
      type: String,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      fullName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      postalCode: String,
    },
    trackingNumber: {
      type: String,
      default: "",
    },
    trackingHistory: [
      {
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    estimatedDelivery: {
      type: Date,
    },
    couponCode: {
      type: String,
    },
    discount: {
      type: Number,
      default: 0,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        admin: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
orderSchema.index({ user: 1, createdAt: -1 });         // user's order history
orderSchema.index({ orderStatus: 1, createdAt: -1 });  // admin status filter
orderSchema.index({ paymentStatus: 1 });               // payment reconciliation
orderSchema.index({ createdAt: -1 });                  // latest orders
orderSchema.index({ "items.product": 1 });             // per-product order lookup

export default mongoose.model("Order", orderSchema);
