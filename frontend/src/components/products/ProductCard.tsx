import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/constants";
import { FaEye, FaBalanceScale, FaHeart } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
  onQuickView?: (product: Product) => void;
  onCompare?: (product: Product) => void;
  isComparing?: boolean;
}

const ProductCard = ({
  product,
  onAddToCart,
  onQuickView,
  onCompare,
  isComparing,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    checkWishlist();
  }, [product._id, user]);

  const checkWishlist = () => {
    if (user) {
      // Will be checked when wishlist is loaded
      api
        .get("/auth/wishlist")
        .then(({ data }) => {
          const ids = data.map((p: any) => p._id);
          setIsInWishlist(ids.includes(product._id));
        })
        .catch(() => {});
    } else {
      const saved = localStorage.getItem("wishlist");
      const ids = saved ? JSON.parse(saved) : [];
      setIsInWishlist(ids.includes(product._id));
    }
  };

  const toggleWishlist = async () => {
    setWishlistLoading(true);
    try {
      if (user) {
        if (isInWishlist) {
          await api.delete(`/auth/wishlist/${product._id}`);
          setIsInWishlist(false);
          success("Removed from wishlist");
        } else {
          await api.post("/auth/wishlist", { productId: product._id });
          setIsInWishlist(true);
          success("Added to wishlist");
        }
      } else {
        const saved = localStorage.getItem("wishlist");
        let ids = saved ? JSON.parse(saved) : [];

        if (isInWishlist) {
          ids = ids.filter((id: string) => id !== product._id);
          setIsInWishlist(false);
          success("Removed from wishlist");
        } else {
          ids.push(product._id);
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
      <div
        className="relative aspect-square overflow-hidden cursor-pointer"
        onClick={() => navigate(`/product/${product._id}`)}
      >
        <img
          src={product.images?.[0] || "/placeholder.jpg"}
          alt={product.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist();
          }}
          disabled={wishlistLoading}
          className={`absolute top-1.5 right-1.5 p-1.5 rounded-full shadow transition-colors ${
            isInWishlist
              ? "bg-red-500 text-white"
              : "bg-white/80 dark:bg-gray-800/80 hover:bg-white"
          }`}
          title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <FaHeart
            className={`w-3 h-3 ${
              isInWishlist ? "text-white" : "text-gray-400 hover:text-red-500"
            }`}
          />
        </button>

        {/* Quick Action Buttons on Hover */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="flex-1 py-1 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 rounded text-[10px] font-medium hover:bg-white transition-colors flex items-center justify-center gap-1"
            >
              <FaEye className="w-2.5 h-2.5" />
              Quick
            </button>
          )}
          {onCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompare(product);
              }}
              className={`flex-1 py-1 rounded text-[10px] font-medium flex items-center justify-center gap-1 ${
                isComparing
                  ? "bg-purple-500 text-white"
                  : "bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-white"
              }`}
            >
              <FaBalanceScale className="w-2.5 h-2.5" />
              Compare
            </button>
          )}
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-2">
        <h3
          className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-0.5 line-clamp-2 cursor-pointer hover:text-[var(--root-color)] transition-colors leading-tight"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.title}
        </h3>

        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm sm:text-base font-bold text-[var(--root-color)]">
            {formatCurrency(product.price)}
          </span>
        </div>

        <button
          onClick={() => onAddToCart(product._id)}
          disabled={product.stock === 0}
          className="w-full py-1.5 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded text-[10px] sm:text-xs hover:from-[var(--root-color)] hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          <svg
            className="w-3 h-3"
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
          ADD TO CART
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
