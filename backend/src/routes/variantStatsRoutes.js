import express from "express";
import { getVariantStats, getAllVariantStats } from "../controllers/variantStatsController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get variant stats for a specific product
router.get("/:productId", auth, isAdmin, getVariantStats);

// Get all variant stats
router.get("/", auth, isAdmin, getAllVariantStats);

export default router;
