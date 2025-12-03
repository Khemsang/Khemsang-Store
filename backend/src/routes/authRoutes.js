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
} from "../controllers/authController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/logout", logout);
router.get("/me", auth, getMe);
router.get("/stats", auth, getUserStats);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);

export default router;
