import User from "../models/User.js";
import crypto from "crypto";
import { generateToken, setTokenCookie } from "../utils/generateToken.js";
import { createActivity } from "./activityController.js";
import {
  sendVerificationEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
} from "../services/emailService.js";
import OTP from "../models/OTP.js";

/**
 * Multi-Vendor Authentication Controller
 * Handles secure authentication for customers, sellers, admins, and super-admins
 */

// CUSTOMER REGISTRATION (Public)
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password"
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create customer
    const user = await User.create({
      name,
      email,
      password,
      role: "customer", // Explicitly set role
      isVerified: false,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("❌ Failed to send verification email:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Customer account created! Please check your email to verify your account.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      // Development mode helpers
      ...(process.env.NODE_ENV === "development" && {
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`,
      }),
    });
  } catch (error) {
    console.error("Customer registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
};

// SELLER REGISTRATION (Public)
export const registerSeller = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone,
      businessName,
      businessType,
      businessAddress,
      businessPhone,
      businessEmail,
      taxId
    } = req.body;

    // Validation
    if (!name || !email || !password || !businessName) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password, and business name"
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create seller (pending approval)
    const seller = await User.create({
      name,
      email,
      password,
      phone,
      role: "seller", // Explicitly set role
      isVerified: false,
      isApproved: false, // Requires admin approval
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 15 * 60 * 1000),
      businessInfo: {
        businessName,
        businessType: businessType || "individual",
        businessAddress,
        businessPhone: businessPhone || phone,
        businessEmail: businessEmail || email,
        taxId
      }
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("❌ Failed to send verification email:", emailError.message);
    }

    // Log seller registration for admin review
    await createActivity(
      seller._id, 
      "seller_registered", 
      `New seller registration: ${businessName}`,
      { businessName, businessType }
    );

    res.status(201).json({
      success: true,
      message: "Seller account created! Please verify your email and wait for admin approval.",
      data: {
        seller: {
          id: seller._id,
          name: seller.name,
          email: seller.email,
          role: seller.role,
          businessName: seller.businessInfo.businessName,
          isApproved: seller.isApproved
        }
      },
      // Development mode helpers
      ...(process.env.NODE_ENV === "development" && {
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`,
      }),
    });
  } catch (error) {
    console.error("Seller registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during seller registration"
    });
  }
};

// ADMIN CREATION (Super Admin Only)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, adminRole = "admin", permissions } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password"
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Create admin
    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
      isVerified: true, // Admins are pre-verified
      isApproved: true,
      adminRole,
      adminStatus: "active",
      permissions: permissions || {
        products: { create: true, edit: true, delete: true },
        orders: { view: true, manage: true },
        users: { view: true, block: true },
        categories: { create: true, edit: true, delete: true },
        banners: { manage: true },
        coupons: { manage: true },
        reviews: { manage: true },
        payments: { view: true },
      },
      createdBy: req.user._id
    });

    // Log admin creation
    await createActivity(
      req.user._id,
      "admin_created",
      `Created new admin: ${name}`,
      { adminEmail: email, adminRole }
    );

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          adminRole: admin.adminRole,
          createdBy: req.user.name
        }
      }
    });
  } catch (error) {
    console.error("Admin creation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during admin creation"
    });
  }
};

// ENHANCED LOGIN WITH ROLE-BASED RESPONSE
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if account is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account has been blocked. Contact support.",
        isBlocked: true
      });
    }

    // Check email verification
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
        needsVerification: true
      });
    }

    // Role-specific checks
    if (user.role === "seller" && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your seller account is pending approval. Please wait for admin approval.",
        isPending: true,
        role: user.role
      });
    }

    if (user.role === "admin" && user.adminStatus === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your admin account has been suspended. Contact Super Admin.",
        isSuspended: true
      });
    }

    // Skip OTP for Super Admin (as per existing logic)
    if (user.role === "super-admin") {
      
      user.otpVerifiedAt = new Date();
      await user.save();

      const token = generateToken(user._id);
      setTokenCookie(res, token);

      return res.json({
        success: true,
        message: "Super Admin login successful",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved
          },
          redirectTo: "/super-admin/dashboard"
        },
        needsOTP: false
      });
    }

    // Generate and send OTP for other users
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    try {
      await sendOTPEmail(email, otpCode);
    } catch (emailError) {
      console.error("❌ Failed to send OTP:", emailError.message);
      if (process.env.NODE_ENV === "development") {
        return res.json({
          success: true,
          message: "OTP sent (email failed, showing in dev mode)",
          otp: otpCode,
          needsOTP: true,
          role: user.role
        });
      }
    }

    res.json({
      success: true,
      message: "OTP sent to your email",
      needsOTP: true,
      role: user.role
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
};

// ENHANCED OTP VERIFICATION WITH ROLE-BASED REDIRECT
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired"
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    if (!(await otpRecord.matchOTP(otp))) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.otpVerifiedAt = new Date();
    await user.save();
    await OTP.deleteOne({ _id: otpRecord._id });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    // Role-based redirect URLs
    const redirectUrls = {
      "customer": "/dashboard",
      "seller": user.isApproved ? "/seller/dashboard" : "/seller/pending",
      "admin": "/admin/dashboard",
      "super-admin": "/super-admin/dashboard"
    };

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved
        },
        redirectTo: redirectUrls[user.role] || "/dashboard"
      }
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during OTP verification"
    });
  }
};

// GET CURRENT USER WITH ROLE INFO
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("createdBy", "name email");

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          isVerified: user.isVerified,
          businessInfo: user.businessInfo,
          permissions: user.permissions,
          createdBy: user.createdBy
        }
      }
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export default {
  registerCustomer,
  registerSeller,
  createAdmin,
  login,
  verifyOTP,
  getCurrentUser
};