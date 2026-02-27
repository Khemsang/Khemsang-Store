import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/constants";
import { FaEye, FaBalanceScale, FaHeart, FaShoppingCart, FaStar } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  stock: number;
  rating?: number;
  numReviews?: number;
  colorVariants?: Array<{
    colorName: string;
    colorCode: string;
    stock: number;
    isActive: boolean;
  }>;
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
  const [imageError, setImageError] = useState(false);

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

  // Calculate discount percentage
  const discountPercent =
    product.discount ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group flex flex-col h-[520px] w-full">
      <div
        className="relative h-[260px] overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-700 flex-shrink-0"
        onClick={() => navigate(`/product/${product._id}`)}
      >
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center">
            <FaShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600" />
          </div>
        ) : (
          <img
            src={product.images?.[0] || "/placeholder.jpg"}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist();
          }}
          disabled={wishlistLoading}
          className={`absolute top-2 right-2 w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            isInWishlist
              ? "bg-red-500 text-white"
              : "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/30"
          }`}
          title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <FaHeart
            className={`w-4 h-4 ${
              isInWishlist ? "text-white" : "text-gray-400 hover:text-red-500"
            } transition-all duration-300`}
          />
        </button>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-red-500 text-white rounded-md shadow-lg">
            <span className="text-xs font-bold">-{discountPercent}%</span>
          </div>
        )}

        {/* Quick Action Buttons on Hover */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="flex-1 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold hover:bg-white transition-colors flex items-center justify-center gap-1.5 shadow-lg"
            >
              <FaEye className="w-3.5 h-3.5" />
              Quick View
            </button>
          )}
          {onCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompare(product);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg transition-colors ${
                isComparing
                  ? "bg-blue-500 text-white"
                  : "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white"
              }`}
            >
              <FaBalanceScale className="w-3.5 h-3.5" />
              Compare
            </button>
          )}
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 min-h-0">
        <h3
          className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-tight h-10 mb-2 flex-shrink-0"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 h-5 mb-2 flex-shrink-0">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`w-3.5 h-3.5 ${
                  product.rating && star <= Math.round(product.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {product.rating ? `(${product.rating.toFixed(1)})` : "(0)"}
          </span>
        </div>

        {/* Price */}
        <div className="mb-2 flex-shrink-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          {product.originalPrice &&
            product.originalPrice > product.price &&
            discountPercent > 0 && (
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                Save {formatCurrency(product.originalPrice - product.price)} ({discountPercent}% OFF)
              </span>
            )}
        </div>

        {/* Stock Status */}
        <div className="mb-2 flex-shrink-0">
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${
            product.stock === 0 ? 'bg-red-50 dark:bg-red-900/20' :
            product.stock <= 5 ? 'bg-orange-50 dark:bg-orange-900/20' :
            product.stock <= 20 ? 'bg-yellow-50 dark:bg-yellow-900/20' :
            'bg-green-50 dark:bg-green-900/20'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              product.stock === 0 ? 'bg-red-500' :
              product.stock <= 5 ? 'bg-orange-500 animate-pulse' :
              product.stock <= 20 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}></div>
            <span className={`text-xs font-semibold ${
              product.stock === 0 ? 'text-red-700 dark:text-red-400' :
              product.stock <= 5 ? 'text-orange-700 dark:text-orange-400' :
              product.stock <= 20 ? 'text-yellow-700 dark:text-yellow-400' :
              'text-green-700 dark:text-green-400'
            }`}>
              {product.stock === 0 ? 'Out of Stock' : `Stock: ${product.stock}`}
            </span>
          </div>
        </div>

        {/* Color Variants */}
        {product.colorVariants && product.colorVariants.length > 0 ? (
          <div className="mb-2 flex-shrink-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Colors:</span>
              {product.colorVariants.filter(v => v.isActive).slice(0, 3).map((variant, idx) => (
                <span key={idx} className="text-xs text-gray-700 dark:text-gray-300">
                  {variant.colorName}{idx < Math.min(2, product.colorVariants!.filter(v => v.isActive).length - 1) ? ',' : ''}
                </span>
              ))}
              {product.colorVariants.filter(v => v.isActive).length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">+{product.colorVariants.filter(v => v.isActive).length - 3} more</span>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-2 flex-shrink-0">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Color: Single</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => navigate(`/product/${product._id}`)}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <FaShoppingCart className="w-4 h-4" />
            Buy Now
          </button>
          <button
            onClick={() => onAddToCart(product._id)}
            disabled={product.stock === 0}
            className="flex-1 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 rounded-lg text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <FaHeart className="w-4 h-4" />
            {product.stock === 0 ? "Sold Out" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
