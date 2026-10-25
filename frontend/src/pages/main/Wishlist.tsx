import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  useWishlistQuery,
  useRemoveFromWishlist,
  useClearWishlist,
} from "../../hooks/useOrdersAndWishlist";
import LazyImage from "../../components/common/LazyImage";
import {
  FaHeart,
  FaShoppingCart,
  FaTrash,
  FaArrowRight,
  FaStar,
  FaBoxOpen,
} from "react-icons/fa";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const WishlistSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
        <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
        <div className="p-4 space-y-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Error state ──────────────────────────────────────────────────────────────

const WishlistError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Failed to load wishlist
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-4">
      Something went wrong. Please try again.
    </p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-[var(--root-color)] text-white rounded-xl hover:opacity-90 transition-opacity font-semibold"
    >
      Retry
    </button>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const Wishlist = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const { data: products = [], isLoading, isError, refetch } = useWishlistQuery(user?._id);
  const removeMutation  = useRemoveFromWishlist(user?._id);
  const clearMutation   = useClearWishlist(user?._id);

  const handleRemove = async (productId: string) => {
    try {
      await removeMutation.mutateAsync(productId);
      success("Removed from wishlist");
    } catch {
      error("Failed to remove from wishlist");
    }
  };

  const handleClear = async () => {
    try {
      await clearMutation.mutateAsync(products.map((p) => p._id));
      success("Wishlist cleared");
    } catch {
      error("Failed to clear wishlist");
    }
  };

  const handleAddToCart = async (productId: string, stock: number) => {
    if (!user) {
      navigate("/login", { state: { from: "/wishlist" } });
      return;
    }
    try {
      setAddingToCart(productId);
      const result = await addToCart(productId, 1);
      if (result?.isNew) success("Added to cart!");
    } catch (err: any) {
      error(err.response?.data?.message ?? "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const discountedPrice = (price: number, discount = 0) =>
    discount ? price - (price * discount) / 100 : price;

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 md:py-20">
      <div className="container px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaHeart className="text-red-500" />
              My Wishlist
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {products.length} {products.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          {products.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearMutation.isPending}
              className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FaTrash /> {clearMutation.isPending ? "Clearing…" : "Clear All"}
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && <WishlistSkeleton />}

        {/* Error */}
        {isError && <WishlistError onRetry={refetch} />}

        {/* Empty */}
        {!isLoading && !isError && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
          >
            <FaBoxOpen className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Save items you love by clicking the heart icon
            </p>
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-3 bg-[var(--root-color)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
            >
              Browse Products <FaArrowRight />
            </button>
          </motion.div>
        )}

        {/* Grid */}
        {!isLoading && !isError && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group"
              >
                {/* Image */}
                <div
                  className="relative cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <LazyImage
                    src={product.images[0] ?? "/placeholder.png"}
                    alt={product.name}
                    aspect="aspect-square"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.discount > 0 && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                      -{product.discount}%
                    </span>
                  )}
                  <button
                    aria-label="Remove from wishlist"
                    onClick={(e) => { e.stopPropagation(); handleRemove(product._id); }}
                    disabled={removeMutation.isPending}
                    className="absolute top-3 right-3 w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <FaHeart />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-[var(--root-color)] uppercase truncate">
                      {product.category}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      <FaStar className="text-yellow-400 text-xs" />
                      <span className="text-xs text-gray-500">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <h3
                    className="font-bold text-gray-900 dark:text-white line-clamp-1 mb-2 cursor-pointer hover:text-[var(--root-color)] transition-colors"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    {product.name}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      Rs. {discountedPrice(product.price, product.discount).toLocaleString()}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        Rs. {product.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product._id, product.stock)}
                      disabled={addingToCart === product._id || product.stock <= 0}
                      className="flex-1 py-3 bg-[var(--root-color)] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <FaShoppingCart />
                      {addingToCart === product._id ? "Adding…" : product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button
                      onClick={() => handleRemove(product._id)}
                      disabled={removeMutation.isPending}
                      aria-label="Remove item"
                      className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-red-100 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Wishlist;
