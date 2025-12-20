import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";
import OTP from "../models/OTP.js";
import crypto from "crypto";
import { sendVerificationEmail } from "../config/email.js";
import {
  sendOTPEmail,
  sendPasswordResetEmail,
} from "../services/emailService.js";
import { generateToken, setTokenCookie } from "../utils/generateToken.js";
import { createActivity } from "./activityController.js";

// SIGNUP - Save to PendingUser until email verified
export const signup = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Provide name, email, and password" });

    // Check if user already exists in main User collection
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Check if pending signup exists - delete old one and create new
    await PendingUser.deleteMany({ email });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save to PendingUser (NOT User) - will be moved after verification
    const pendingUser = await PendingUser.create({
      name,
      email,
      password,
      isAdmin: isAdmin || false,
      verificationToken,
      verificationTokenExpires,
    });

    try {
      await sendVerificationEmail(email, verificationToken);
      return res.status(201).json({
        message:
          "Verification email sent! Please check your email to complete signup.",
        pendingUserId: pendingUser._id,
      });
    } catch {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      return res.status(201).json({
        message: "Verification email sent! (Dev mode - check console)",
        pendingUserId: pendingUser._id,
        verificationToken:
          process.env.NODE_ENV === "development"
            ? verificationToken
            : undefined,
        verificationUrl:
          process.env.NODE_ENV === "development" ? verificationUrl : undefined,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// VERIFY EMAIL - Move from PendingUser to User
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("🔍 Verifying token:", token?.substring(0, 20) + "...");

    // First check in PendingUser collection
    const pendingUser = await PendingUser.findOne({ verificationToken: token });
    console.log("📋 PendingUser found:", pendingUser ? "Yes" : "No");

    if (pendingUser) {
      console.log("⏰ Token expires:", pendingUser.verificationTokenExpires);
      console.log("⏰ Current time:", new Date());
      console.log(
        "⏰ Is expired:",
        pendingUser.verificationTokenExpires < Date.now()
      );

      // Check if token expired
      if (pendingUser.verificationTokenExpires < Date.now()) {
        await PendingUser.deleteOne({ _id: pendingUser._id });
        console.log("❌ Token expired, deleted pending user");
        return res.status(400).json({
          message: "Verification link expired. Please signup again.",
          reason: "token_expired",
        });
      }

      // Check if email already taken (race condition or double-click)
      const existingUser = await User.findOne({ email: pendingUser.email });
      if (existingUser) {
        await PendingUser.deleteOne({ _id: pendingUser._id });
        // If user exists and is verified, treat as success (double-click scenario)
        if (existingUser.isVerified) {
          const authToken = generateToken(existingUser._id);
          setTokenCookie(res, authToken);
          console.log("✅ User already verified (double-click), logging in");
          return res.json({
            message: "Email verified successfully!",
            user: existingUser,
          });
        }
        return res.status(400).json({
          message: "Email already registered. Please login.",
        });
      }

      // Create actual user from pending user - WITHOUT password first to avoid double-hashing
      const user = new User({
        name: pendingUser.name,
        email: pendingUser.email,
        isAdmin: pendingUser.isAdmin,
        isVerified: true,
        lastVerificationToken: token,
        otpVerifiedAt: new Date(), // Skip OTP for first login after email verification
      });

      // Set password directly (already hashed in PendingUser) - bypass the pre-save hook
      user.password = pendingUser.password;
      await user.save({ validateBeforeSave: false });

      // Delete pending user
      await PendingUser.deleteOne({ _id: pendingUser._id });

      console.log("✅ User created with correct password hash");

      // Auto-login
      const authToken = generateToken(user._id);
      setTokenCookie(res, authToken);

      console.log("✅ User created and verified:", user.email);
      return res.json({
        message: "Email verified successfully! Welcome!",
        user,
      });
    }

    // PendingUser not found - check if user was already verified with this token
    // This handles double-click / React StrictMode double-render scenarios
    const verifiedUser = await User.findOne({ lastVerificationToken: token });

    if (verifiedUser && verifiedUser.isVerified) {
      console.log(
        "✅ Found user verified with this token (double-click), logging in"
      );
      const authToken = generateToken(verifiedUser._id);
      setTokenCookie(res, authToken);
      return res.json({
        message: "Email verified successfully!",
        user: verifiedUser,
      });
    }

    // Check if already verified user (for old flow compatibility)
    const user = await User.findOne({ verificationToken: token });
    if (user) {
      if (user.isVerified) {
        const authToken = generateToken(user._id);
        setTokenCookie(res, authToken);
        return res.json({ message: "Email already verified", user });
      }

      if (
        user.verificationTokenExpires &&
        user.verificationTokenExpires < Date.now()
      ) {
        return res.status(400).json({
          message: "Verification link expired. Please request a new one.",
        });
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();

      const authToken = generateToken(user._id);
      setTokenCookie(res, authToken);

      return res.json({ message: "Email verified successfully", user });
    }

    return res.status(400).json({
      message: "Invalid or expired verification link. Please signup again.",
      reason: "token_not_found",
    });
  } catch (err) {
    console.error("❌ Verify email error:", err);
    res.status(500).json({ message: err.message, reason: "server_error" });
  }
};

// RESEND VERIFICATION
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();
    await sendVerificationEmail(email, verificationToken);

    res.json({ message: "Verification email sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(
      "User found, password hash:",
      user.password?.substring(0, 10) + "..."
    );
    console.log("Password starts with $2:", user.password?.startsWith("$2"));

    const isMatch = await user.matchPassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password" });

    if (!user.isVerified)
      return res
        .status(400)
        .json({ message: "Verify your email first", needsVerification: true });

    // Check if user/admin is blocked
    if (user.isBlocked) {
      const message = user.isAdmin
        ? "Your admin account has been suspended. Please contact Super Admin for assistance."
        : "Your account has been blocked. Please contact support for assistance.";
      return res.status(403).json({
        message,
        isBlocked: true,
      });
    }

    // Check if admin status is suspended
    if (user.isAdmin && user.adminStatus === "suspended") {
      return res.status(403).json({
        message:
          "Your admin account has been suspended. Please contact Super Admin for assistance.",
        isSuspended: true,
      });
    }

    // Super Admin bypasses OTP
    if (user.isSuperAdmin) {
      const token = generateToken(user._id);
      setTokenCookie(res, token);
      return res.json(user);
    }

    const otpValidMinutes = 15;
    const needsOTP =
      !user.otpVerifiedAt ||
      Date.now() - new Date(user.otpVerifiedAt) > otpValidMinutes * 60 * 1000;

    if (needsOTP) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.deleteMany({ email });
      await OTP.create({
        email,
        otp: otpCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      });

      try {
        await sendOTPEmail(email, otpCode);
      } catch {
        console.log(`Dev OTP for ${email}: ${otpCode}`);
      }

      return res.json({
        needsOTP: true,
        message: "OTP sent to email",
        otp: process.env.NODE_ENV === "development" ? otpCode : undefined,
      });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord)
      return res.status(400).json({ message: "OTP not found or expired" });

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    if (!(await otpRecord.matchOTP(otp)))
      return res.status(400).json({ message: "Invalid OTP" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.otpVerifiedAt = new Date();
    await user.save();
    await OTP.deleteOne({ _id: otpRecord._id });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({ message: "OTP verified", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESEND OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    try {
      await sendOTPEmail(email, otpCode);
    } catch {
      console.log(`Dev OTP for ${email}: ${otpCode}`);
    }

    res.json({
      message: "OTP sent",
      otp: process.env.NODE_ENV === "development" ? otpCode : undefined,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out" });
};

// GET CURRENT USER
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  const { name, email, phone, address, avatar } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (email && email !== user.email) {
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already in use" });
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.address = address || user.address;
  user.avatar = avatar || user.avatar;
  await user.save();

  await createActivity(user._id, "profile_updated", "Updated profile info", {
    name: user.name,
    email: user.email,
  });
  res.json({ message: "Profile updated", user });
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res
      .status(400)
      .json({ message: "Provide current and new password" });

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch)
    return res.status(400).json({ message: "Current password incorrect" });

  user.password = newPassword;
  await user.save();
  await createActivity(user._id, "password_changed", "Changed password");

  res.json({ message: "Password changed successfully" });
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    try {
      await sendPasswordResetEmail(email, resetToken);
      res.json({ message: "Password reset link sent to your email" });
    } catch {
      // Fallback for dev mode
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      res.json({
        message: "Password reset link sent",
        resetToken:
          process.env.NODE_ENV === "development" ? resetToken : undefined,
        resetUrl: process.env.NODE_ENV === "development" ? resetUrl : undefined,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log(
      "Reset password request - token:",
      token ? token.substring(0, 10) + "..." : "missing"
    );

    if (!token || !password)
      return res
        .status(400)
        .json({ message: "Token and password are required" });

    // First check if token exists (without expiry check)
    const userWithToken = await User.findOne({ resetPasswordToken: token });
    console.log("User with token found:", !!userWithToken);

    if (userWithToken) {
      console.log("Token expires:", userWithToken.resetPasswordExpires);
      console.log("Current time:", new Date());
      console.log(
        "Is expired:",
        new Date() > userWithToken.resetPasswordExpires
      );
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      if (userWithToken) {
        return res.status(400).json({
          message: "Reset token has expired. Please request a new one.",
        });
      }
      return res.status(400).json({ message: "Invalid reset token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// USER STATS
export const getUserStats = async (req, res) => {
  const Order = (await import("../models/Order.js")).default;
  const orders = await Order.find({ user: req.user._id });

  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (o) => o.orderStatus === "delivered"
  ).length;
  const pendingOrders = orders.filter((o) =>
    ["pending", "processing"].includes(o.orderStatus)
  ).length;
  const totalSpent = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  res.json({
    totalOrders,
    completedOrders,
    pendingOrders,
    totalSpent,
    wishlistItems: 0,
    reviewsGiven: 0,
  });
};

// ADDRESS MANAGEMENT
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { label, fullName, phone, address, city, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    // If this is default, unset other defaults
    if (isDefault) {
      user.addresses = user.addresses.map((addr) => ({
        ...addr.toObject(),
        isDefault: false,
      }));
    }

    user.addresses.push({ label, fullName, phone, address, city, isDefault });
    await user.save();

    res.json({ message: "Address added", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { label, fullName, phone, address, city, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    const addrIndex = user.addresses.findIndex(
      (a) => a._id.toString() === addressId
    );
    if (addrIndex === -1)
      return res.status(404).json({ message: "Address not found" });

    // If setting as default, unset others
    if (isDefault) {
      user.addresses = user.addresses.map((addr) => ({
        ...addr.toObject(),
        isDefault: false,
      }));
    }

    user.addresses[addrIndex] = {
      ...user.addresses[addrIndex].toObject(),
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
    res.status(500).json({ message: err.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== addressId
    );
    await user.save();

    res.json({ message: "Address deleted", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// WISHLIST MANAGEMENT
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    const updatedUser = await User.findById(req.user._id).populate("wishlist");
    res.json({ message: "Added to wishlist", wishlist: updatedUser.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("wishlist");
    res.json({
      message: "Removed from wishlist",
      wishlist: updatedUser.wishlist,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
