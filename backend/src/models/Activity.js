import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "order",
        "product_view",
        "cart_add",
        "cart_remove",
        "review",
        "wishlist",
        "profile_update",
        "password_change",
        "login",
        "signup",
      ],
      required: true,
    },
    icon: {
      type: String,
      default: "FaCircle",
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
activitySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Activity", activitySchema);
