import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  image?: string;
  stock?: number;
  discount?: number;
}

interface SimpleProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  badge?: React.ReactNode;
  showOriginalPrice?: boolean;
  linkPrefix?: string;
}

const SimpleProductCard = ({
  product,
  onAddToCart,
  badge,
  showOriginalPrice = false,
  linkPrefix = "/product",
}: SimpleProductCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const imageUrl = product.images?.[0] || product.image || "/placeholder.jpg";
  const isOutOfStock = product.stock === 0;

  const discount =
    product.discount ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
      {/* Image Section */}
      <div
        className="relative aspect-square overflow-hidden cursor-pointer bg-gray-50 dark:bg-gray-700"
        onClick={() => navigate(`${linkPrefix}/${product._id}`)}
      >
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center">
            <FaShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors"
        >
          <FaHeart className="w-3 h-3 text-gray-400 hover:text-red-500 transition-colors" />
        </button>

        {/* Badge (NEW, SALE, etc.) */}
        {badge && <div className="absolute top-2 left-2">{badge}</div>}

        {/* Discount Badge */}
        {discount > 0 && !badge && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
            -{discount}%
          </span>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-2 sm:p-3">
        {/* Title */}
        <h3
          className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1 cursor-pointer hover:text-blue-600 transition-colors leading-tight min-h-[2.5rem]"
          onClick={() => navigate(`${linkPrefix}/${product._id}`)}
        >
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm sm:text-base font-bold text-blue-600">
            Rs. {product.price.toLocaleString()}
          </span>
          {showOriginalPrice &&
            product.originalPrice &&
            product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                Rs. {product.originalPrice.toLocaleString()}
              </span>
            )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(product);
          }}
          disabled={isOutOfStock}
          className="w-full py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-orange-600 text-white rounded text-[10px] sm:text-xs font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          <FaShoppingCart className="w-3 h-3" />
          {isOutOfStock ? "Out of Stock" : "ADD TO CART"}
        </button>
      </div>
    </div>
  );
};

export default SimpleProductCard;
