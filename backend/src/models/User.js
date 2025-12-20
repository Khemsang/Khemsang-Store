import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    addresses: [
      {
        label: { type: String, default: "Home" },
        fullName: String,
        phone: String,
        address: String,
        city: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    adminRole: {
      type: String,
      enum: ["admin", "manager", "support"],
      default: "admin",
    },
    adminStatus: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
    },
    suspendedAt: {
      type: Date,
    },
    suspendedUntil: {
      type: Date,
    },
    suspendReason: {
      type: String,
    },
    // Admin Permissions
    permissions: {
      products: {
        create: { type: Boolean, default: true },
        edit: { type: Boolean, default: true },
        delete: { type: Boolean, default: true },
      },
      orders: {
        view: { type: Boolean, default: true },
        manage: { type: Boolean, default: true },
      },
      users: {
        view: { type: Boolean, default: true },
        block: { type: Boolean, default: false },
      },
      categories: {
        create: { type: Boolean, default: true },
        edit: { type: Boolean, default: true },
        delete: { type: Boolean, default: true },
      },
      banners: {
        manage: { type: Boolean, default: true },
      },
      coupons: {
        manage: { type: Boolean, default: true },
      },
      reviews: {
        manage: { type: Boolean, default: true },
      },
      payments: {
        view: { type: Boolean, default: false },
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    otpVerifiedAt: {
      type: Date,
    },
    otpExpiresAt: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    lastVerificationToken: {
      type: String,
    },
    warnings: [
      {
        message: { type: String },
        date: { type: Date, default: Date.now },
        issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
