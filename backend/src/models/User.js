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
    // Enhanced Role System for Multi-Vendor Platform
    role: {
      type: String,
      enum: ["customer", "seller", "admin", "super-admin"],
      default: "customer",
      required: true,
    },
    // Legacy fields (keeping for backward compatibility)
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
    // Seller-specific fields
    isApproved: {
      type: Boolean,
      default: false, // Sellers need approval
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    // Business Information for Sellers
    businessInfo: {
      businessName: { type: String },
      businessType: { 
        type: String, 
        enum: ["individual", "company", "partnership"],
      },
      businessAddress: { type: String },
      businessPhone: { type: String },
      businessEmail: { type: String },
      taxId: { type: String },
      bankAccount: {
        accountName: { type: String },
        accountNumber: { type: String },
        bankName: { type: String },
        routingNumber: { type: String },
      },
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

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true }); // Email lookup
userSchema.index({ role: 1, isApproved: 1 }); // Role-based queries
userSchema.index({ isVerified: 1 }); // Verification status
userSchema.index({ createdAt: -1 }); // Latest users
userSchema.index({ "businessInfo.businessName": 1 }); // Business search

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

// Role-based helper methods
userSchema.methods.isCustomer = function () {
  return this.role === "customer";
};

userSchema.methods.isSeller = function () {
  return this.role === "seller";
};

userSchema.methods.isAdminRole = function () {
  return this.role === "admin";
};

userSchema.methods.isSuperAdminRole = function () {
  return this.role === "super-admin";
};

userSchema.methods.isApprovedSeller = function () {
  return this.role === "seller" && this.isApproved === true;
};

userSchema.methods.canAccessAdminPanel = function () {
  return this.role === "admin" || this.role === "super-admin";
};

userSchema.methods.canManageSellers = function () {
  return this.role === "admin" || this.role === "super-admin";
};

// Pre-save middleware to sync legacy fields with new role system
userSchema.pre("save", function (next) {
  // Sync legacy fields with new role system
  if (this.role === "super-admin") {
    this.isSuperAdmin = true;
    this.isAdmin = true;
    this.isApproved = true;
  } else if (this.role === "admin") {
    this.isAdmin = true;
    this.isSuperAdmin = false;
    this.isApproved = true;
  } else {
    this.isAdmin = false;
    this.isSuperAdmin = false;
  }
  
  next();
});

export default mongoose.model("User", userSchema);
