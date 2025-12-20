import express from "express";
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

// Public routes
router.post("/signup", signup);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

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
