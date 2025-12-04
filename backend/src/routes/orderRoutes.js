import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  verifyPayment,
  paymentFailure,
} from "../controllers/orderController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// User routes
router.post("/", auth, createOrder);
router.get("/my-orders", auth, getMyOrders);
router.get("/:id", auth, getOrderById);

// Payment callbacks (public)
router.get("/esewa/verify", verifyPayment);
router.get("/esewa/failure", paymentFailure);

// Admin routes
router.get("/", auth, isAdmin, getAllOrders);
router.put("/:id/status", auth, isAdmin, updateOrderStatus);

export default router;
