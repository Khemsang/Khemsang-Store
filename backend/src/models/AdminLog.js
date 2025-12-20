import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    actionType: {
      type: String,
      enum: [
        "product_create",
        "product_update",
        "product_delete",
        "order_update",
        "user_block",
        "user_unblock",
        "category_create",
        "category_update",
        "category_delete",
        "settings_update",
        "admin_create",
        "admin_update",
        "admin_delete",
        "login",
        "logout",
        "other",
      ],
      default: "other",
    },
    targetType: {
      type: String,
      enum: [
        "product",
        "order",
        "user",
        "category",
        "settings",
        "admin",
        "other",
      ],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
adminLogSchema.index({ admin: 1, createdAt: -1 });
adminLogSchema.index({ actionType: 1, createdAt: -1 });

export default mongoose.model("AdminLog", adminLogSchema);
