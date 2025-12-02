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
import { auth, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", auth, createOrder);
router.get("/my-orders", auth, getMyOrders);
router.get("/esewa/verify", verifyPayment);
router.get("/esewa/failure", paymentFailure);
router.get("/:id", auth, getOrderById);
router.get("/", auth, isAdmin, getAllOrders);
router.put("/:id/status", auth, isAdmin, updateOrderStatus);

export default router;
