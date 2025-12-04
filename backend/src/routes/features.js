import express from "express";
import * as featuredProductController from "../controllers/featuredProductController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", featuredProductController.getAllFeaturedProducts);
router.get("/:id", featuredProductController.getFeaturedProductById);

// Admin routes
router.post("/", auth, isAdmin, featuredProductController.createFeaturedProduct);
router.put("/:id", auth, isAdmin, featuredProductController.updateFeaturedProduct);
router.delete("/:id", auth, isAdmin, featuredProductController.deleteFeaturedProduct);

export default router;
