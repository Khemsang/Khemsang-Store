  import Review from "../models/Review.js";
  import Product from "../models/Product.js";

  // Get all reviews for a product
  export const getProductReviews = async (req, res) => {
    try {
      const { productId } = req.params;
      const reviews = await Review.find({ product: productId })
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      res.json(reviews);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching reviews", error: error.message });
    }
  };

  // Create a review
  export const createReview = async (req, res) => {
    try {
      const { productId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user._id;

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if user already reviewed this product
      const existingReview = await Review.findOne({
        product: productId,
        user: userId,
      });

      if (existingReview) {
        return res
          .status(400)
          .json({ message: "You have already reviewed this product" });
      }

      // Create review
      const review = new Review({
        product: productId,
        user: userId,
        rating,
        comment,
      });

      await review.save();

      // Populate user data before sending response
      await review.populate("user", "name email");

      res.status(201).json(review);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error creating review", error: error.message });
    }
  };

  // Update a review
  export const updateReview = async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user._id;

      const review = await Review.findById(reviewId);

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Check if user owns this review
      if (review.user.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "You can only edit your own reviews" });
      }

      review.rating = rating || review.rating;
      review.comment = comment || review.comment;

      await review.save();
      await review.populate("user", "name email");

      res.json(review);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error updating review", error: error.message });
    }
  };

  // Delete a review
  export const deleteReview = async (req, res) => {
    try {
      const { reviewId } = req.params;
      const userId = req.user._id;

      const review = await Review.findById(reviewId);

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Check if user owns this review or is admin
      if (review.user.toString() !== userId.toString() && !req.user.isAdmin) {
        return res
          .status(403)
          .json({ message: "You can only delete your own reviews" });
      }

      await Review.findByIdAndDelete(reviewId);

      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting review", error: error.message });
    }
  };

  // Like/Unlike a review
  export const toggleLikeReview = async (req, res) => {
    try {
      const { reviewId } = req.params;
      const userId = req.user._id;

      const review = await Review.findById(reviewId);

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      const likeIndex = review.likes.indexOf(userId);

      if (likeIndex > -1) {
        // Unlike
        review.likes.splice(likeIndex, 1);
      } else {
        // Like
        review.likes.push(userId);
      }

      await review.save();
      await review.populate("user", "name email");

      res.json(review);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error toggling like", error: error.message });
    }
  };

  // Get review statistics for a product
  export const getReviewStats = async (req, res) => {
    try {
      const { productId } = req.params;

      const stats = await Review.aggregate([
        { $match: { product: mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            ratings: {
              $push: "$rating",
            },
          },
        },
      ]);

      if (stats.length === 0) {
        return res.json({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      }

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      stats[0].ratings.forEach((rating) => {
        ratingDistribution[rating]++;
      });

      res.json({
        averageRating: stats[0].averageRating.toFixed(1),
        totalReviews: stats[0].totalReviews,
        ratingDistribution,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching stats", error: error.message });
    }
  };
