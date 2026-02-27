import express from "express";
import {
  getActiveFlashSales,
  getHomeFlashSales,
  createFlashSale,
  updateFlashSale,
  getAllFlashSales,
} from "../controllers/flashSaleController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getActiveFlashSales);
router.get("/home", getHomeFlashSales);

// Admin routes
router.post("/create", auth, isAdmin, createFlashSale);
router.patch("/update/:id", auth, isAdmin, updateFlashSale);
router.get("/admin/all", auth, isAdmin, getAllFlashSales);

export default router;
