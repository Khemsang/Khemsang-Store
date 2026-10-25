import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { generateToken, setTokenCookie } from "../utils/generateToken.js";
import { requireFields, isValidEmail } from "../utils/validate.js";
import { createActivity } from "./activityController.js";
import logger from "../config/logger.js";
import {
  sendVerificationEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendSuperAdminPasswordResetEmail,
} from "../services/emailService.js";
import OTP from "../models/OTP.js";
import { notifyNewCustomer } from "../services/notificationService.js";

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const missing = requireFields(req.body, ["name", "email", "password"]);
    if (missing) return res.status(400).json({ message: missing });

    if (!isValidEmail(email))
      return res.status(400).json({ message: "Invalid email address" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    await PendingUser.deleteOne({ email });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await PendingUser.create({
      name,
      email,
      password,
      verificationToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    sendVerificationEmail(email, verificationToken).catch((err) =>
      logger.warn("Failed to send verification email", { email, message: err.message })
    );

    return res.status(201).json({
      message:
        "Almost there! Please check your email and click the verification link to create your account.",
      email,
      ...(process.env.NODE_ENV === "development" && {
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
      }),
    });
  } catch (err) {
    logger.error("signup error", { message: err.message });
    res.status(500).json({ message: "Signup failed. Please try again." });
  }
};

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token || req.query.token;

    if (!token)
      return res.status(400).json({ message: "Verification token is required." });

    const pending = await PendingUser.findOne({ verificationToken: token });

    if (!pending) {
      return res.status(400).json({
        message:
          "Verification link has expired or is invalid. Please sign up again or request a new link.",
        expired: true,
      });
    }

    if (new Date() > pending.expiresAt) {
      await PendingUser.deleteOne({ _id: pending._id });
      return res.status(400).json({
        message: "Verification link has expired. Please request a new one.",
        expired: true,
      });
    }

    const existingUser = await User.findOne({ email: pending.email });
    if (existingUser) {
      await PendingUser.deleteOne({ _id: pending._id });
      return res.json({
        message: "Email already verified. Please login.",
        verified: true,
        redirectTo: "/login",
      });
    }

    const now = new Date();
    const userDoc = {
      name: pending.name,
      email: pending.email,
      password: pending.password,
      role: "customer",
      isAdmin: false,
      isSuperAdmin: false,
      isVerified: true,
      isBlocked: false,
      isApproved: false,
      wishlist: [],
      addresses: [],
      refreshTokens: [],
      warnings: [],
      cart: [],
      createdAt: now,
      updatedAt: now,
    };
    const result = await User.collection.insertOne(userDoc);
    const userId = result.insertedId;

    await PendingUser.deleteOne({ _id: pending._id });

    User.findById(userId)
      .then((u) => notifyNewCustomer(u))
      .catch((err) =>
        logger.warn("Failed to send new-customer notification", { message: err.message })
      );

    return res.json({
      message: "Email verified successfully! Please login to continue.",
      verified: true,
      redirectTo: "/login",
    });
  } catch (err) {
    logger.error("verifyEmail error", { message: err.message });
    res.status(500).json({ message: "Email verification failed. Please try again." });
  }
};

// ─── RESEND VERIFICATION ──────────────────────────────────────────────────────
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already verified. Please login." });

    const pending = await PendingUser.findOne({ email });
    if (!pending)
      return res
        .status(404)
        .json({ message: "No pending signup found for this email. Please sign up first." });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    pending.verificationToken = verificationToken;
    pending.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await pending.save();

    await sendVerificationEmail(email, verificationToken);

    res.json({
      message: "Verification email sent. Please check your inbox.",
      ...(process.env.NODE_ENV === "development" && {
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
      }),
    });
  } catch (err) {
    logger.error("resendVerification error", { message: err.message });
    res.status(500).json({ message: "Failed to resend verification email." });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const missing = requireFields(req.body, ["email", "password"]);
    if (missing) return res.status(400).json({ message: missing });

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      const pending = await PendingUser.findOne({ email });
      if (pending) {
        return res.status(403).json({
          message:
            "Please verify your email first. Check your inbox for the verification link.",
          needsVerification: true,
          email,
        });
      }
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    if (user.isBlocked) {
      const message = user.isAdmin
        ? "Your admin account has been suspended. Please contact Super Admin for assistance."
        : "Your account has been blocked. Please contact support for assistance.";
      return res.status(403).json({ message, isBlocked: true });
    }

    if (user.isAdmin && user.adminStatus === "suspended") {
      return res.status(403).json({
        message:
          "Your admin account has been suspended. Please contact Super Admin for assistance.",
        isSuspended: true,
      });
    }

    // Skip OTP if already verified within the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (user.otpVerifiedAt && user.otpVerifiedAt > fifteenMinutesAgo) {
      const token = generateToken(user._id);
      setTokenCookie(res, token);

      const userRole =
        user.role ||
        (user.isSuperAdmin ? "super-admin" : user.isAdmin ? "admin" : "customer");
      const redirectUrls = {
        customer: "/dashboard",
        seller: user.isApproved ? "/seller/dashboard" : "/seller/pending",
        admin: "/admin/dashboard",
        "super-admin": "/super-admin/dashboard",
      };

      return res.json({
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: userRole,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin,
          isApproved: user.isApproved,
          isVerified: user.isVerified,
        },
        redirectTo: redirectUrls[userRole] || "/dashboard",
        needsOTP: false,
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    sendOTPEmail(email, otpCode).catch((err) => {
      logger.warn("Failed to send OTP email", { email, message: err.message });
    });

    res.json({ message: "OTP sent to your email", needsOTP: true });
  } catch (err) {
    logger.error("login error", { message: err.message });
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const missing = requireFields(req.body, ["email", "otp"]);
    if (missing) return res.status(400).json({ message: missing });

    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord)
      return res.status(400).json({ message: "OTP not found or expired" });

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await otpRecord.matchOTP(String(otp));
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.otpVerifiedAt = new Date();
    await user.save();
    await OTP.deleteOne({ _id: otpRecord._id });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    const userRole =
      user.role ||
      (user.isSuperAdmin ? "super-admin" : user.isAdmin ? "admin" : "customer");
    const redirectUrls = {
      customer: "/dashboard",
      seller: user.isApproved ? "/seller/dashboard" : "/seller/pending",
      admin: "/admin/dashboard",
      "super-admin": "/super-admin/dashboard",
    };

    res.json({
      message: "OTP verified",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: userRole,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        isApproved: user.isApproved,
        isVerified: user.isVerified,
      },
      redirectTo: redirectUrls[userRole] || "/dashboard",
    });
  } catch (err) {
    logger.error("verifyOTP error", { message: err.message });
    res.status(500).json({ message: "OTP verification failed. Please try again." });
  }
};

// ─── RESEND OTP ───────────────────────────────────────────────────────────────
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    sendOTPEmail(email, otpCode).catch((err) =>
      logger.warn("Failed to resend OTP", { email, message: err.message })
    );

    res.json({ message: "OTP sent" });
  } catch (err) {
    logger.error("resendOTP error", { message: err.message });
    res.status(500).json({ message: "Failed to resend OTP." });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out" });
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const userRole =
      user.role ||
      (user.isSuperAdmin ? "super-admin" : user.isAdmin ? "admin" : "customer");

    res.json({ ...user.toObject(), role: userRole });
  } catch (err) {
    logger.error("getMe error", { message: err.message });
    res.status(500).json({ message: "Failed to fetch user." });
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      if (!isValidEmail(email))
        return res.status(400).json({ message: "Invalid email address" });
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already in use" });
    }

    if (name)    user.name    = name;
    if (email)   user.email   = email;
    if (phone)   user.phone   = phone;
    if (address) user.address = address;
    if (avatar)  user.avatar  = avatar;
    await user.save();

    createActivity(user._id, "profile_updated", "Updated profile info", {
      name: user.name,
      email: user.email,
    }).catch(() => {});

    res.json({ message: "Profile updated", user });
  } catch (err) {
    logger.error("updateProfile error", { message: err.message });
    res.status(500).json({ message: "Failed to update profile." });
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const missing = requireFields(req.body, ["currentPassword", "newPassword"]);
    if (missing) return res.status(400).json({ message: missing });

    const { currentPassword, newPassword } = req.body;

    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });

    user.password = newPassword;
    await user.save();

    createActivity(user._id, "password_changed", "Changed password").catch(() => {});

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    logger.error("changePassword error", { message: err.message });
    res.status(500).json({ message: "Failed to change password." });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiryMinutes = user.isSuperAdmin ? 30 : 15;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + expiryMinutes * 60 * 1000);
    await user.save();

    createActivity(
      user._id,
      user.isSuperAdmin
        ? "super_admin_password_reset_requested"
        : "password_reset_requested",
      "Requested password reset"
    ).catch(() => {});

    const sendEmail = user.isSuperAdmin
      ? sendSuperAdminPasswordResetEmail
      : sendPasswordResetEmail;

    try {
      await sendEmail(email, resetToken);
      res.json({
        message: "Password reset link sent to your email",
        note: `Link expires in ${expiryMinutes} minutes`,
      });
    } catch (emailErr) {
      logger.warn("Failed to send password reset email", {
        email,
        message: emailErr.message,
      });
      res.json({
        message: "Password reset link generated",
        ...(process.env.NODE_ENV === "development" && {
          resetToken,
          resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
        }),
        note: `Link expires in ${expiryMinutes} minutes`,
      });
    }
  } catch (err) {
    logger.error("forgotPassword error", { message: err.message });
    res.status(500).json({ message: "Failed to process password reset request." });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const missing = requireFields(req.body, ["token", "password"]);
    if (missing) return res.status(400).json({ message: missing });

    const { token, password } = req.body;

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    // Check token existence first (separate from expiry) for a precise error message
    const userWithToken = await User.findOne({ resetPasswordToken: token });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: userWithToken
          ? "Reset token has expired. Please request a new one."
          : "Invalid reset token",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: "Password reset successful. You can now login with your new password.",
    });
  } catch (err) {
    logger.error("resetPassword error", { message: err.message });
    res.status(500).json({ message: "Failed to reset password." });
  }
};

// ─── USER STATS ───────────────────────────────────────────────────────────────
export const getUserStats = async (req, res) => {
  try {
    const Order = (await import("../models/Order.js")).default;
    const orders = await Order.find({ user: req.user._id });

    res.json({
      totalOrders: orders.length,
      completedOrders: orders.filter((o) => o.orderStatus === "delivered").length,
      pendingOrders: orders.filter((o) =>
        ["pending", "processing"].includes(o.orderStatus)
      ).length,
      totalSpent: orders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.totalAmount, 0),
      wishlistItems: 0,
      reviewsGiven: 0,
    });
  } catch (err) {
    logger.error("getUserStats error", { message: err.message });
    res.status(500).json({ message: "Failed to fetch user stats." });
  }
};

// ─── USERS COUNT (public) ─────────────────────────────────────────────────────
export const getUsersCount = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user count." });
  }
};

// ─── ADDRESS MANAGEMENT ───────────────────────────────────────────────────────
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch addresses." });
  }
};

export const addAddress = async (req, res) => {
  try {
    const missing = requireFields(req.body, ["fullName", "phone", "address", "city"]);
    if (missing) return res.status(400).json({ message: missing });

    const { label, fullName, phone, address, city, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses = user.addresses.map((a) => ({ ...a.toObject(), isDefault: false }));
    }

    user.addresses.push({ label, fullName, phone, address, city, isDefault });
    await user.save();

    res.json({ message: "Address added", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to add address." });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { label, fullName, phone, address, city, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    const idx = user.addresses.findIndex((a) => a._id.toString() === addressId);
    if (idx === -1) return res.status(404).json({ message: "Address not found" });

    if (isDefault) {
      user.addresses = user.addresses.map((a) => ({ ...a.toObject(), isDefault: false }));
    }

    user.addresses[idx] = {
      ...user.addresses[idx].toObject(),
      label,
      fullName,
      phone,
      address,
      city,
      isDefault,
    };
    await user.save();

    res.json({ message: "Address updated", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to update address." });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    user.addresses = user.addresses.filter((a) => a._id.toString() !== addressId);
    await user.save();

    res.json({ message: "Address deleted", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete address." });
  }
};

// ─── WISHLIST MANAGEMENT ──────────────────────────────────────────────────────
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch wishlist." });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "productId is required" });

    const user = await User.findById(req.user._id);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    const updated = await User.findById(req.user._id).populate("wishlist");
    res.json({ message: "Added to wishlist", wishlist: updated.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Failed to update wishlist." });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    const updated = await User.findById(req.user._id).populate("wishlist");
    res.json({ message: "Removed from wishlist", wishlist: updated.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Failed to update wishlist." });
  }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ success: false, message: "Refresh token not found" });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    if (decoded.type !== "refresh")
      return res.status(401).json({ success: false, message: "Invalid token type" });

    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(401).json({ success: false, message: "User not found" });

    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const tokenExists = user.refreshTokens.some(
      (t) => t.token === hashedToken && new Date() < t.expiresAt
    );
    if (!tokenExists)
      return res
        .status(401)
        .json({ success: false, message: "Refresh token invalid or expired" });

    const { generateAccessToken } = await import("../middleware/auth.unified.js");
    const newAccessToken = generateAccessToken(user._id);

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ success: true, message: "Access token refreshed" });
  } catch (err) {
    logger.error("refreshAccessToken error", { message: err.message });
    res.status(500).json({ message: "Failed to refresh token." });
  }
};

export const logoutWithRefreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken && req.user) {
      const hashedToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: { token: hashedToken } },
      });
    }

    res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
    res.cookie("refreshToken", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/api/auth/refresh",
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    logger.error("logoutWithRefreshToken error", { message: err.message });
    res.status(500).json({ message: "Logout failed." });
  }
};

export const cleanupExpiredTokens = async () => {
  try {
    await User.updateMany(
      {},
      { $pull: { refreshTokens: { expiresAt: { $lt: new Date() } } } }
    );
  } catch (err) {
    logger.error("cleanupExpiredTokens error", { message: err.message });
  }
};
