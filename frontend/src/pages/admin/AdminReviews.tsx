import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStar,
  FaTrash,
  FaEye,
  FaCheck,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useMinimumLoading } from "../../hooks/useMinimumLoading";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import { Pagination } from "../../components/ui/pagination";
import Loading from "../../components/common/Loading";

interface Review {
  _id: string;
  user: { name: string; email: string };
  product: { _id: string; title: string; images: string[] };
  rating: number;
  comment: string;
  createdAt: string;
  isApproved?: boolean;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumLoading(loading, 1000);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  

  useScrollToTop(currentPage);
  
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {

      const { data: productsRes } = await api.get("/products");
      const products = Array.isArray(productsRes) ? productsRes : (productsRes.products ?? []);
      const allReviews: Review[] = [];

      for (const product of products.slice(0, 20)) {
        try {
          const { data: productReviews } = await api.get(
            `/reviews/product/${product._id}`
          );
          productReviews.forEach((review: any) => {
            allReviews.push({
              ...review,
              product: {
                _id: product._id,
                title: product.title,
                images: product.images,
              },
            });
          });
        } catch (e) {

        }
      }

      setReviews(
        allReviews.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter((r) => r._id !== reviewId));
      showToast("Review deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete review", "error");
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      review.product?.title?.toLowerCase().includes(search.toLowerCase()) ||
      review.comment?.toLowerCase().includes(search.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "5star") return matchesSearch && review.rating === 5;
    if (filter === "low") return matchesSearch && review.rating <= 2;
    return matchesSearch;
  });


  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, endIndex);


  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  if (showLoading) {
    return <Loading text="Loading reviews..." fullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 md:py-8">
      <div className="container">
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-3">
            <FaStar className="text-yellow-500" /> Review Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {reviews.length} total reviews
          </p>
        </div>

        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Reviews</option>
              <option value="5star">5 Star Only</option>
              <option value="low">Low Ratings (1-2)</option>
            </select>
          </div>
        </div>

        
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
              <FaStar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Reviews Found
              </h3>
              <p className="text-gray-500">
                No reviews match your search criteria
              </p>
            </div>
          ) : (
            currentReviews.map((review) => (
              <div
                key={review._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  
                  <div 
                    className="flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/product/${review.product?._id}`)}
                  >
                    <img
                      src={review.product?.images?.[0] || "/placeholder.jpg"}
                      alt={review.product?.title}
                      className="w-20 h-20 object-cover rounded-xl hover:opacity-80 transition-opacity"
                    />
                  </div>

                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {review.user?.name || "Anonymous"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {review.user?.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p 
                      className="text-sm text-purple-600 mb-2 cursor-pointer hover:text-purple-700 hover:underline"
                      onClick={() => navigate(`/product/${review.product?._id}`)}
                    >
                      Product: {review.product?.title}
                    </p>

                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {review.comment}
                    </p>

                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/product/${review.product?._id}`)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <FaEye className="w-3 h-3" />
                        View Product
                      </button>
                      <button
                        onClick={() => deleteReview(review._id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <FaTrash className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        
        {filteredReviews.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredReviews.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
