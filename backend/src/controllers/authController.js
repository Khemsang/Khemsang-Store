import User from "../models/User.js";
import OTP from "../models/OTP.js";
import crypto from "crypto";
import { sendVerificationEmail } from "../config/email.js";
import { sendOTPEmail } from "../services/emailService.js";
import { generateToken, setTokenCookie } from "../utils/generateToken.js";
import { createActivity } from "./activityController.js";

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and password" });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password,
      isAdmin: isAdmin || false,
      isVerified: false,
      verificationToken,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
      console.log("✅ Verification email sent to:", email);

      res.status(201).json({
        message:
          "Signup successful! Please check your email to verify your account.",
        userId: user._id,
      });
    } catch (emailError) {
      console.error(
        "❌ Failed to send verification email:",
        emailError.message
      );

      // In development, provide verification URL
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      console.log("\n📝 DEVELOPMENT MODE - Use this URL to verify:");
      console.log("   " + verificationUrl);
      console.log("   Or copy from the alert in the browser\n");

      // Return token in development for testing
      res.status(201).json({
        message: "Signup successful! Email service unavailable in development.",
        userId: user._id,
        verificationToken:
          process.env.NODE_ENV === "development"
            ? verificationToken
            : undefined,
        verificationUrl:
          process.env.NODE_ENV === "development" ? verificationUrl : undefined,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });
    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired verification link" });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    const authToken = generateToken(user._id);
    setTokenCookie(res, authToken);

    res.json({
      message: "Email verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/resend-verification
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    await user.save();

    try {
      await sendVerificationEmail(email, verificationToken);
      res.json({ message: "Verification email sent successfully" });
    } catch (err) {
      console.error("❌ Failed to send verification email:", err.message);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first",
        needsVerification: true,
      });
    }

    // Check if OTP verification is needed (15 minutes validity)
    const now = new Date();
    const otpValidityMinutes = 15;
    const needsOTP =
      !user.otpVerifiedAt ||
      now - new Date(user.otpVerifiedAt) > otpValidityMinutes * 60 * 1000;

    if (needsOTP) {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Delete old OTPs for this email
      await OTP.deleteMany({ email });

      // Store OTP in database
      await OTP.create({
        email,
        otp: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      // Send OTP via email
      try {
        await sendOTPEmail(email, otpCode);
        console.log(`✅ OTP sent to ${email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send OTP email:`, emailError.message);
        console.log(`🔐 Development OTP for ${email}: ${otpCode}`);
      }

      return res.json({
        needsOTP: true,
        message: "OTP sent to your email",
        otp: process.env.NODE_ENV === "development" ? otpCode : undefined,
      });
    }

    // OTP still valid, login directly
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find OTP record
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Verify OTP
    const isMatch = await otpRecord.matchOTP(otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update user's OTP verified timestamp
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.otpVerifiedAt = new Date();
    await user.save();

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate token and login
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      message: "OTP verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/resend-otp
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete old OTPs
    await OTP.deleteMany({ email });

    // Create new OTP
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send OTP via email
    try {
      await sendOTPEmail(email, otpCode);
      console.log(`✅ OTP resent to ${email}`);
    } catch (emailError) {
      console.error(`❌ Failed to resend OTP email:`, emailError.message);
      console.log(`🔐 Development OTP for ${email}: ${otpCode}`);
    }

    res.json({
      message: "OTP sent successfully",
      otp: process.env.NODE_ENV === "development" ? otpCode : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Google OAuth
import passport from "passport";

// GET /api/auth/google
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// GET /api/auth/google/callback
export const googleAuthCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
      );
    }

    // Generate JWT token
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/success`);
  })(req, res, next);
};

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.avatar = avatar || user.avatar;

    await user.save();

    // Log activity
    await createActivity(
      user._id,
      "profile_updated",
      `Updated profile information`,
      { name: user.name, email: user.email }
    );

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        role: user.isAdmin ? "admin" : "user",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Please provide both current and new password" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log activity
    await createActivity(
      user._id,
      "password_changed",
      `Changed account password`,
      {}
    );

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/auth/stats
export const getUserStats = async (req, res) => {
  try {
    const Order = (await import("../models/Order.js")).default;

    // Get user orders
    const orders = await Order.find({ user: req.user._id });

    // Calculate stats
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.orderStatus === "delivered"
    ).length;
    const pendingOrders = orders.filter(
      (o) => o.orderStatus === "pending" || o.orderStatus === "processing"
    ).length;
    const totalSpent = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Get wishlist count (if you have wishlist feature)
    const wishlistItems = 0; // TODO: Implement wishlist

    // Get reviews count (if you have reviews feature)
    const reviewsGiven = 0; // TODO: Implement reviews

    res.json({
      totalOrders,
      completedOrders,
      pendingOrders,
      totalSpent,
      wishlistItems,
      reviewsGiven,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
