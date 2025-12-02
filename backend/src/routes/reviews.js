import express from "express";
import * as reviewController from "../controllers/reviewController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", reviewController.getProductReviews);
router.get("/product/:productId/stats", reviewController.getReviewStats);

// Protected routes (require authentication)
router.post("/product/:productId", protect, reviewController.createReview);
router.put("/:reviewId", protect, reviewController.updateReview);
router.delete("/:reviewId", protect, reviewController.deleteReview);
router.post("/:reviewId/like", protect, reviewController.toggleLikeReview);

export default router;
