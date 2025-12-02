import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { api } from "../../services/api";

interface FeaturedProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  productId?: string;
}

const FeaturedProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [product, setProduct] = useState<FeaturedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchFeaturedProduct();
  }, [id]);

  const fetchFeaturedProduct = async () => {
    try {
      const { data } = await api.get(`/featured-products/${id}`);
      setProduct(data);
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/featured/${id}` } });
      return;
    }

    // If productId exists, add that product to cart
    if (product?.productId) {
      try {
        await addToCart(product.productId, quantity);
        success("Added to cart!");
      } catch (err: any) {
        error(err.response?.data?.message || "Failed to add to cart");
      }
    } else {
      error("This product is not available for purchase");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/featured/${id}` } });
      return;
    }

    if (product?.productId) {
      try {
        await addToCart(product.productId, quantity);
        success("Product added to cart!");
        navigate("/checkout");
      } catch (err: any) {
        error(err.response?.data?.message || "Failed to add to cart");
      }
    } else {
      error("This product is not available for purchase");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--root-color)]"></div>
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
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded-xl hover:from-[var(--root-color)] hover:to-purple-700 transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
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
          <span className="text-gray-900 dark:text-white font-medium truncate">
            {product.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Image */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="relative">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                  <img
                    src={product.image || "/placeholder.jpg"}
                    alt={product.title}
                    className="w-full h-full object-contain p-8"
                  />
                  {product.discount && product.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
                      -{product.discount}% OFF
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--root-color)]/10 to-purple-600/10 text-[var(--root-color)] rounded-full text-sm font-semibold">
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
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {product.title}
              </h1>

              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--root-color)] to-purple-600 bg-clip-text text-transparent">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <span className="text-xl text-gray-500 line-through">
                        Rs. {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                </div>
                {product.discount && product.discount > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-semibold">
                    You save Rs.{" "}
                    {(
                      (product.originalPrice || 0) - product.price
                    ).toLocaleString()}{" "}
                    ({product.discount}% off)
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                  Quantity:
                </span>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-[var(--root-color)] hover:text-white transition-all shadow-sm"
                  >
                    <svg
                      className="w-5 h-5"
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
                  <span className="w-16 text-center font-bold text-xl text-gray-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-[var(--root-color)] hover:text-white transition-all shadow-sm"
                  >
                    <svg
                      className="w-5 h-5"
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.productId}
                  className="flex-1 py-4 px-6 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-[var(--root-color)] rounded-xl hover:bg-[var(--root-color)] hover:text-white transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <svg
                    className="w-5 h-5"
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
                  disabled={!product.productId}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded-xl hover:from-[var(--root-color)] hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Buy Now
                </button>
              </div>

              {!product.productId && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-4 text-center">
                  This is a featured showcase item. Contact us for availability.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProductDetails;
