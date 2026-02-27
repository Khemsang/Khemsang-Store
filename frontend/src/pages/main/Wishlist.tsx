import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  FaHeart,
  FaShoppingCart,
  FaTrash,
  FaArrowRight,
  FaStar,
  FaBoxOpen,
} from "react-icons/fa";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  discount?: number;
  stock?: number;
  rating?: number;
}

const Wishlist = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    try {
      setLoading(true);

      if (user) {
        // Load from backend if logged in
        const { data } = await api.get("/auth/wishlist");
        
        // Filter out any null/undefined products (in case product was deleted)
        const validProducts = data.filter((product: any) => product && product._id);
        
        const wishlistProducts = validProducts.map((product: any) => ({
          _id: product._id,
          name: product.title,
          price: product.price,
          images: product.images || [],
          category: product.category?.name || product.category || "Uncategorized",
          discount: product.discount || 0,
          stock: product.stock || 0,
          rating: product.rating || 0,
        }));
        setProducts(wishlistProducts);
        setWishlistIds(wishlistProducts.map((p: Product) => p._id));
      } else {
        // Load from localStorage if not logged in
        const saved = localStorage.getItem("wishlist");
        const ids = saved ? JSON.parse(saved) : [];
        setWishlistIds(ids);

        if (ids.length > 0) {
          const { data } = await api.get("/products");
          const wishlistProducts = data
            .filter((p: any) => ids.includes(p._id))
            .map((product: any) => ({
              _id: product._id,
              name: product.title,
              price: product.price,
              images: product.images || [],
              category: product.category?.name || product.category || "Uncategorized",
              discount: product.discount || 0,
              stock: product.stock || 0,
              rating: product.rating || 0,
            }));
          setProducts(wishlistProducts);
        }
      }
    } catch (err: any) {
      console.error("Error loading wishlist:", err);
      error(err.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      if (user) {
        await api.delete(`/auth/wishlist/${productId}`);
      } else {
        const newIds = wishlistIds.filter((id) => id !== productId);
        localStorage.setItem("wishlist", JSON.stringify(newIds));
      }

      setWishlistIds(wishlistIds.filter((id) => id !== productId));
      setProducts(products.filter((p) => p._id !== productId));
      success("Removed from wishlist");
    } catch (err) {
      error("Failed to remove from wishlist");
    }
  };

  const clearWishlist = async () => {
    try {
      if (user) {
        // Remove all items from backend
        for (const id of wishlistIds) {
          await api.delete(`/auth/wishlist/${id}`);
        }
      } else {
        localStorage.removeItem("wishlist");
      }

      setWishlistIds([]);
      setProducts([]);
      success("Wishlist cleared");
    } catch (err) {
      error("Failed to clear wishlist");
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      navigate("/login", { state: { from: "/wishlist" } });
      return;
    }
    try {
      setAddingToCart(product._id);
      const result = await addToCart(product._id, 1);
      
      // Only show toast if it's a new item
      if (result?.isNew) {
        success("Added to cart!");
      }
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price - (price * discount) / 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--root-color)]"></div>
      </div>
    );
  }

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
              onClick={clearWishlist}
              className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <FaTrash /> Clear All
            </button>
          )}
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
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
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group"
              >
                {/* Image */}
                <div
                  className="relative aspect-square cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <img
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.discount && product.discount > 0 && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                      -{product.discount}%
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(product._id);
                    }}
                    className="absolute top-3 right-3 w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <FaHeart />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-[var(--root-color)] uppercase">
                      {product.category}
                    </p>
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400 text-xs" />
                      <span className="text-xs text-gray-500">
                        {product.rating?.toFixed(1) || "4.5"}
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
                      Rs.{" "}
                      {getDiscountedPrice(
                        product.price,
                        product.discount
                      ).toLocaleString()}
                    </span>
                    {product.discount && product.discount > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        Rs. {product.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={
                        addingToCart === product._id ||
                        (product.stock ?? 10) <= 0
                      }
                      className="flex-1 py-3 bg-[var(--root-color)] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <FaShoppingCart />
                      {addingToCart === product._id
                        ? "Adding..."
                        : "Add to Cart"}
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-red-100 hover:text-red-500 transition-colors"
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
