import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  verifyPayment,
  paymentFailure,
  getEsewaSignature,
} from "../controllers/orderController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// User routes
router.post("/", auth, createOrder);
router.get("/my-orders", auth, getMyOrders);

// Payment callbacks (public) - must be before /:id route
router.get("/esewa/verify", verifyPayment);
router.get("/esewa/failure", paymentFailure);
router.post("/esewa/signature", auth, getEsewaSignature);

// Order by ID
router.get("/:id", auth, getOrderById);

// Admin routes
router.get("/", auth, isAdmin, getAllOrders);
router.put("/:id/status", auth, isAdmin, updateOrderStatus);

export default router;
