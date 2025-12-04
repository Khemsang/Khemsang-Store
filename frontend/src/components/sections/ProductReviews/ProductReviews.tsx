import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { api } from "../../../services/api";
import { FaStar, FaThumbsUp, FaEdit, FaTrash } from "react-icons/fa";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/product/${productId}`);
      setReviews(data);
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get(`/reviews/product/${productId}/stats`);
      setStats(data);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      error("Please login to submit a review");
      return;
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        await api.put(`/reviews/${editingReview._id}`, formData);
        success("Review updated successfully!");
      } else {
        await api.post(`/reviews/product/${productId}`, formData);
        success("Review submitted successfully!");
      }
      setFormData({ rating: 5, comment: "" });
      setShowForm(false);
      setEditingReview(null);
      fetchReviews();
      fetchStats();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({ rating: review.rating, comment: review.comment });
    setShowForm(true);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      success("Review deleted successfully!");
      fetchReviews();
      fetchStats();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to delete review");
    }
  };

  const handleLike = async (reviewId: string) => {
    if (!user) {
      error("Please login to like reviews");
      return;
    }

    try {
      await api.post(`/reviews/${reviewId}/like`);
      fetchReviews();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to like review");
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onChange?: (rating: number) => void
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={() => interactive && onChange && onChange(star)}
            className={`${
              interactive ? "cursor-pointer hover:scale-110" : ""
            } transition-transform`}
            disabled={!interactive}
          >
            <FaStar
              className={`text-2xl ${
                star <= rating
                  ? "text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const userHasReviewed = reviews.some((r) => r.user._id === user?._id);

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      {stats && stats.totalReviews > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="text-center md:border-r border-gray-200 dark:border-gray-700 md:pr-8">
              <div className="text-5xl font-bold text-[var(--root-color)] mb-2">
                {stats.averageRating}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(Number(stats.averageRating)))}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {stats.totalReviews}{" "}
                {stats.totalReviews === 1 ? "Review" : "Reviews"}
              </div>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                    {rating} star
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: `${
                          stats.totalReviews > 0
                            ? (stats.ratingDistribution[rating] /
                                stats.totalReviews) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                    {stats.ratingDistribution[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {user && !userHasReviewed && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 px-6 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded-xl hover:from-[var(--root-color)] hover:to-purple-700 transition-all duration-200 font-semibold"
        >
          Write a Review
        </button>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {editingReview ? "Edit Your Review" : "Write a Review"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              {renderStars(formData.rating, true, (rating) =>
                setFormData({ ...formData, rating })
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Comment
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--root-color)]"
                placeholder="Share your experience with this product..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded-xl hover:from-[var(--root-color)] hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : editingReview
                  ? "Update Review"
                  : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingReview(null);
                  setFormData({ rating: 5, comment: "" });
                }}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Customer Reviews
        </h3>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-[var(--root-color)] to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {review.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {review.user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {user?._id === review.user._id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {review.comment}
              </p>

              <button
                onClick={() => handleLike(review._id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  user && review.likes.includes(user._id)
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <FaThumbsUp />
                <span className="font-semibold">{review.likes.length}</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
