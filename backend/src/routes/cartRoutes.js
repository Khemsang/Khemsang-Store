import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart
} from "../controllers/cartController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All cart routes require authentication
router.get("/", auth, getCart);
router.post("/", auth, addToCart);
router.post("/merge", auth, mergeCart);
router.put("/item/:itemId", auth, updateCartItem);
router.delete("/item/:itemId", auth, removeFromCart);
router.delete("/", auth, clearCart);

export default router;
