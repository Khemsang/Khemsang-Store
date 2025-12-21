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

// SIGNUP - With email verification
export const signup = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Provide name, email, and password" });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      isAdmin: isAdmin || false,
      isVerified: false,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
      console.log("✅ Verification email sent to:", email);
    } catch (emailError) {
      console.error(
        "❌ Failed to send verification email:",
        emailError.message
      );
    }

    return res.status(201).json({
      message:
        "Account created! Please check your email to verify your account.",
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification link.",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    const authToken = generateToken(user._id);
    setTokenCookie(res, authToken);

    return res.json({ message: "Email verified successfully!", user });
  } catch (err) {
    console.error("❌ Verify email error:", err);
    res.status(500).json({ message: err.message });
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

// LOGIN - Send OTP
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password" });

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

    // Generate and send OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    try {
      await sendOTPEmail(email, otpCode);
      console.log("✅ OTP sent to:", email);
    } catch (emailError) {
      console.error("❌ Failed to send OTP:", emailError.message);
      // In development, show OTP in response
      if (process.env.NODE_ENV === "development") {
        return res.json({
          message: "OTP sent (email failed, showing in dev mode)",
          otp: otpCode,
          requiresOTP: true,
        });
      }
    }

    res.json({
      message: "OTP sent to your email",
      requiresOTP: true,
    });
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
