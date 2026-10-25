import Review from "../models/Review.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import logger from "../config/logger.js";
import { requireFields, isInRange } from "../utils/validate.js";

// GET /api/reviews/product/:productId
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    logger.error("getProductReviews failed", { message: err.message });
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// POST /api/reviews/product/:productId — protected
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const missing = requireFields(req.body, ["rating", "comment"]);
    if (missing) return res.status(400).json({ message: missing });

    if (!isInRange(rating, 1, 5)) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }
    if (typeof comment !== "string" || comment.trim().length === 0) {
      return res.status(400).json({ message: "comment must be a non-empty string" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing)
      return res.status(400).json({ message: "You have already reviewed this product" });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      comment: comment.trim(),
    });

    await review.populate("user", "name email");
    res.status(201).json(review);
  } catch (err) {
    logger.error("createReview failed", { message: err.message });
    res.status(500).json({ message: "Failed to create review" });
  }
};

// PUT /api/reviews/:reviewId — protected
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (rating !== undefined && !isInRange(rating, 1, 5)) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }
    if (comment !== undefined) {
      if (typeof comment !== "string" || comment.trim().length === 0) {
        return res.status(400).json({ message: "comment must be a non-empty string" });
      }
    }

    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own reviews" });
    }

    if (rating  !== undefined) review.rating  = Number(rating);
    if (comment !== undefined) review.comment = comment.trim();

    await review.save();
    await review.populate("user", "name email");
    res.json(review);
  } catch (err) {
    logger.error("updateReview failed", { message: err.message });
    res.status(500).json({ message: "Failed to update review" });
  }
};

// DELETE /api/reviews/:reviewId — protected
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "You can only delete your own reviews" });
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    logger.error("deleteReview failed", { message: err.message });
    res.status(500).json({ message: "Failed to delete review" });
  }
};

// POST /api/reviews/:reviewId/like — protected
export const toggleLikeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const idx = review.likes.indexOf(req.user._id);
    if (idx > -1) {
      review.likes.splice(idx, 1);
    } else {
      review.likes.push(req.user._id);
    }

    await review.save();
    await review.populate("user", "name email");
    res.json(review);
  } catch (err) {
    logger.error("toggleLikeReview failed", { message: err.message });
    res.status(500).json({ message: "Failed to toggle like" });
  }
};

// GET /api/reviews/product/:productId/stats
export const getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;

    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratings: { $push: "$rating" },
        },
      },
    ]);

    if (!stats.length) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    }

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats[0].ratings.forEach((r) => { ratingDistribution[r]++; });

    res.json({
      averageRating: Number(stats[0].averageRating.toFixed(1)),
      totalReviews: stats[0].totalReviews,
      ratingDistribution,
    });
  } catch (err) {
    logger.error("getReviewStats failed", { message: err.message });
    res.status(500).json({ message: "Failed to fetch review stats" });
  }
};

// GET /api/reviews/count
export const getAllReviewsCount = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    res.json({ totalReviews });
  } catch (err) {
    logger.error("getAllReviewsCount failed", { message: err.message });
    res.status(500).json({ message: "Failed to fetch review count" });
  }
};
