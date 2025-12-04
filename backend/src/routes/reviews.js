import express from "express";
import * as reviewCtrl from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/product/:productId", reviewCtrl.getProductReviews);
router.get("/product/:productId/stats", reviewCtrl.getReviewStats);

// Protected
router.post("/product/:productId", protect, reviewCtrl.createReview);
router.put("/:reviewId", protect, reviewCtrl.updateReview);
router.delete("/:reviewId", protect, reviewCtrl.deleteReview);
router.post("/:reviewId/like", protect, reviewCtrl.toggleLikeReview);

export default router;
