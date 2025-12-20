import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import { FaHeart } from "react-icons/fa";
import ProductReviews from "../../components/sections/ProductReviews/ProductReviews";
import { RecentlyViewed, addToRecentlyViewed } from "../../components/sections";
import {
  ShareProduct,
  SizeGuide,
  EstimatedDelivery,
  NotifyMe,
} from "../../components/ui";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  createdBy: {
    name: string;
    email: string;
  };
}

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [reviewStats, setReviewStats] = useState<{
    averageRating: number;
    totalReviews: number;
  } | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviewStats();
    checkWishlist();
    // Add to recently viewed
    if (id) {
      addToRecentlyViewed(id);
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const { data } = await api.get(`/reviews/product/${id}/stats`);
      setReviewStats(data);
    } catch (err: any) {
      console.error("Failed to fetch review stats:", err);
    }
  };

  const checkWishlist = async () => {
    if (!id) return;
    if (user) {
      try {
        const { data } = await api.get("/auth/wishlist");
        const ids = data.map((p: any) => p._id);
        setIsInWishlist(ids.includes(id));
      } catch {
        setIsInWishlist(false);
      }
    } else {
      const saved = localStorage.getItem("wishlist");
      const ids = saved ? JSON.parse(saved) : [];
      setIsInWishlist(ids.includes(id));
    }
  };

  const toggleWishlist = async () => {
    if (!id) return;
    setWishlistLoading(true);
    try {
      if (user) {
        if (isInWishlist) {
          await api.delete(`/auth/wishlist/${id}`);
          setIsInWishlist(false);
          success("Removed from wishlist");
        } else {
          await api.post("/auth/wishlist", { productId: id });
          setIsInWishlist(true);
          success("Added to wishlist");
        }
      } else {
        const saved = localStorage.getItem("wishlist");
        let ids = saved ? JSON.parse(saved) : [];

        if (isInWishlist) {
          ids = ids.filter((i: string) => i !== id);
          setIsInWishlist(false);
          success("Removed from wishlist");
        } else {
          ids.push(id);
          setIsInWishlist(true);
          success("Added to wishlist");
        }
        localStorage.setItem("wishlist", JSON.stringify(ids));
      }
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    try {
      await addToCart(product!._id, quantity);
      success("Added to cart!");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    try {
      await addToCart(product!._id, quantity);
      success("Product added to cart!");
      navigate("/checkout");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
        <div className="flex flex-col items-center">
          {/* Product Card Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-gray-100 dark:border-gray-700">
            {/* Image Skeleton */}
            <div className="relative w-full aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-shimmer"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-300 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Title Skeleton */}
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-3 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-shimmer"></div>
            </div>
            <div className="h-6 w-2/3 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-4 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-shimmer"></div>
            </div>

            {/* Price Skeleton */}
            <div className="h-8 w-1/2 bg-gradient-to-r from-[var(--root-color)]/20 to-purple-500/20 rounded-lg mb-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-shimmer"></div>
            </div>

            {/* Button Skeleton */}
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-shimmer"></div>
              </div>
              <div className="flex-1 h-12 bg-gradient-to-r from-[var(--root-color)]/30 to-purple-500/30 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <p className="mt-6 text-gray-500 dark:text-gray-400 text-sm font-medium">
            Loading product details...
          </p>
        </div>

        {/* Shimmer Animation Style */}
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 1.5s infinite;
          }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Product Not Found
          </h2>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded-xl hover:from-[var(--root-color)] hover:to-purple-700 transition-all duration-200"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 py-4 sm:py-6 md:py-8 lg:py-12">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm mb-3 sm:mb-4 md:mb-6 bg-white dark:bg-gray-800 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 dark:text-gray-400 hover:text-[var(--root-color)] transition-colors flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Home
          </button>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <button
            onClick={() => navigate("/products")}
            className="text-gray-600 dark:text-gray-400 hover:text-[var(--root-color)] transition-colors"
          >
            Products
          </button>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-gray-900 dark:text-white font-medium truncate">
            {product.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
          {/* Image Gallery */}
          <div className="lg:col-span-5 space-y-2 sm:space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 shadow-lg sm:shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="relative group">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                  <img
                    src={product.images[selectedImage] || "/placeholder.jpg"}
                    alt={product.title}
                    className="w-full h-full object-contain p-8 cursor-pointer transition-transform duration-300 group-hover:scale-110"
                    onClick={() => setShowImageModal(true)}
                  />

                  {/* Zoom Icon Overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/5 cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                      <svg
                        className="w-6 h-6 text-[var(--root-color)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                        />
                      </svg>
                    </div>
                  </div>

                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
                      <span className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-2xl">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 sm:gap-2 mt-2 sm:mt-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === idx
                          ? "border-[var(--root-color)] ring-2 ring-[var(--root-color)]/30 scale-105"
                          : "border-gray-200 dark:border-gray-600 hover:border-[var(--root-color)]/50 hover:scale-105"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.title} ${idx + 1}`}
                        className="w-full h-full object-contain p-1.5 bg-gray-50 dark:bg-gray-700"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-7 space-y-2 sm:space-y-3 md:space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg sm:shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4 flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-[var(--root-color)]/10 to-purple-600/10 text-[var(--root-color)] rounded-full text-xs sm:text-sm font-semibold">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {product.category}
                </span>
                <span
                  className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-xs sm:text-sm font-bold ${
                    product.stock > 0
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </span>
              </div>

              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 leading-tight">
                {product.title}
              </h1>

              {/* Rating Display */}
              {reviewStats && reviewStats.totalReviews > 0 && (
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                  {renderStars(Math.round(Number(reviewStats.averageRating)))}
                  <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {reviewStats.averageRating}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    ({reviewStats.totalReviews}{" "}
                    {reviewStats.totalReviews === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}

              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed mb-3 sm:mb-4">
                {product.description}
              </p>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[var(--root-color)] to-purple-600 bg-clip-text text-transparent">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs">
                    Inclusive of all taxes
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-3 sm:mb-4">
                <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm sm:text-base">
                  Quantity:
                </span>
                <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-[var(--root-color)] hover:text-white transition-all shadow-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <span className="w-8 sm:w-10 text-center font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-[var(--root-color)] hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Size Guide */}
              <div className="mb-2 sm:mb-3">
                <SizeGuide />
              </div>

              {/* Action Buttons */}
              {product.stock > 0 ? (
                <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-[var(--root-color)] rounded-lg sm:rounded-xl hover:bg-[var(--root-color)] hover:text-white transition-all duration-200 font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-[var(--root-color)] hover:to-purple-700 transition-all duration-200 font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    className={`py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-all duration-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg ${
                      isInWishlist
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-500"
                    }`}
                    title={
                      isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"
                    }
                  >
                    <FaHeart className={`w-4 h-4 ${isInWishlist ? "" : ""}`} />
                  </button>
                  <ShareProduct productTitle={product.title} />
                </div>
              ) : (
                <div className="space-y-3">
                  <NotifyMe
                    productId={product._id}
                    productTitle={product.title}
                  />
                  <div className="flex justify-center">
                    <ShareProduct productTitle={product.title} />
                  </div>
                </div>
              )}

              {/* Estimated Delivery */}
              <div className="mt-3 sm:mt-4">
                <EstimatedDelivery />
              </div>
            </div>

            {/* Product Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 shadow-lg sm:shadow-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                <svg
                  className="w-5 h-5 text-[var(--root-color)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Product Information
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    Category
                  </span>
                  <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
                    {product.category}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    Stock Status
                  </span>
                  <span
                    className={`font-semibold text-xs sm:text-sm ${
                      product.stock > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} Available`
                      : "Out of Stock"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 sm:py-2">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                    SKU
                  </span>
                  <span className="font-mono font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
                    {product._id.slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-4 sm:mt-6 md:mt-8">
          <ProductReviews productId={product._id} />
        </div>

        {/* Recently Viewed Section */}
        <div className="mt-4 sm:mt-6 md:mt-8">
          <RecentlyViewed />
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-2xl z-10"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center gap-4">
            {/* Main Modal Image */}
            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={product.images[selectedImage] || "/placeholder.jpg"}
                alt={product.title}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((prev) =>
                        prev === 0 ? product.images.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-2xl"
                  >
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((prev) =>
                        prev === product.images.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-2xl"
                  >
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Modal Thumbnails */}
            {product.images.length > 1 && (
              <div
                className="flex gap-3 overflow-x-auto pb-2 px-4 max-w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-[var(--root-color)] ring-4 ring-[var(--root-color)]/50 scale-110"
                        : "border-gray-400 hover:border-[var(--root-color)]"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Image Counter */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-900 dark:text-white shadow-lg">
              {selectedImage + 1} / {product.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
