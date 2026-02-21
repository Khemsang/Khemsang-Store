import express from "express";
import { authLimiter, strictLimiter } from "../middleware/security.js";
import User from "../models/User.js";
import {
  signup,
  login,
  logout,
  verifyEmail,
  verifyOTP,
  resendVerification,
  resendOTP,
  getMe,
  updateProfile,
  changePassword,
  getUserStats,
  forgotPassword,
  resetPassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Public routes - with rate limiting
router.post("/signup", authLimiter, signup);
router.get("/verify-email/:token", verifyEmail); // URL parameter format
router.get("/verify-email", verifyEmail); // Query parameter format
router.post("/resend-verification", authLimiter, resendVerification);
router.post("/login", authLimiter, login);
router.post("/verify-otp", authLimiter, verifyOTP);
router.post("/resend-otp", authLimiter, resendOTP);
router.post("/logout", logout);
router.post("/forgot-password", strictLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Debug route (development only)
if (process.env.NODE_ENV === "development") {
  router.get("/debug/user/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const user = await User.findOne({ email }).select("+verificationToken +verificationTokenExpires");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        email: user.email,
        isVerified: user.isVerified,
        hasVerificationToken: !!user.verificationToken,
        tokenExpires: user.verificationTokenExpires,
        currentTime: new Date(),
        tokenExpired: user.verificationTokenExpires ? new Date() > user.verificationTokenExpires : null,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
}

// Protected routes
router.get("/me", auth, getMe);
router.get("/stats", auth, getUserStats);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);

// Address management
router.get("/addresses", auth, getAddresses);
router.post("/addresses", auth, addAddress);
router.put("/addresses/:addressId", auth, updateAddress);
router.delete("/addresses/:addressId", auth, deleteAddress);

// Wishlist management
router.get("/wishlist", auth, getWishlist);
router.post("/wishlist", auth, addToWishlist);
router.delete("/wishlist/:productId", auth, removeFromWishlist);

export default router;
