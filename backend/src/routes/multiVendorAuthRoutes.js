import express from "express";
import {
  registerCustomer,
  registerSeller,
  createAdmin,
  login,
  verifyOTP,
  getCurrentUser
} from "../controllers/multiVendorAuthController.js";
import { 
  auth as authenticate,
  requireSuperAdmin,
} from "../middleware/auth.js";

const noop = (req, res, next) => next();
const rateLimitSensitive = noop;

const router = express.Router();

/**
 * Multi-Vendor Authentication Routes
 * Secure role-based authentication system
 */

// PUBLIC ROUTES

// Customer Registration (Public)
router.post("/register/customer", rateLimitSensitive, registerCustomer);

// Seller Registration (Public) 
router.post("/register/seller", rateLimitSensitive, registerSeller);

// Login (All roles)
router.post("/login", rateLimitSensitive, login);

// OTP Verification
router.post("/verify-otp", verifyOTP);

// PROTECTED ROUTES

// Get current user info
router.get("/me", authenticate, getCurrentUser);

// SUPER ADMIN ONLY ROUTES

// Create Admin Account (Super Admin Only)
router.post(
  "/create-admin",
  ...requireSuperAdmin,
  rateLimitSensitive,
  createAdmin
);

// LEGACY ROUTES (for backward compatibility)
// These routes redirect to the new multi-vendor system

// Legacy signup -> redirect to customer registration
router.post("/signup", (req, res) => {
  res.status(301).json({
    success: false,
    message: "This endpoint has been moved. Use /api/auth/register/customer for customer registration or /api/auth/register/seller for seller registration.",
    redirectTo: "/api/auth/register/customer"
  });
});

export default router;