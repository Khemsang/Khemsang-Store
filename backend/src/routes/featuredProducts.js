import express from "express";
import * as featuredProductController from "../controllers/featuredProductController.js";

const router = express.Router();

// Public routes
router.get("/", featuredProductController.getAllFeaturedProducts);
router.get("/:id", featuredProductController.getFeaturedProductById);

// Admin routes
router.post("/", featuredProductController.createFeaturedProduct);
router.put("/:id", featuredProductController.updateFeaturedProduct);
router.delete("/:id", featuredProductController.deleteFeaturedProduct);

export default router;
