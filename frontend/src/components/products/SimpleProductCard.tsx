import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/constants";
import { FaHeart, FaShoppingCart, FaStar } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  stock: number;
  rating?: number;
  numReviews?: number;
  colors?: string[];
  colorVariants?: Array<{
    colorName: string;
    colorCode: string;
    stock: number;
    isActive: boolean;
  }>;
}

interface SimpleProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  showOriginalPrice?: boolean;
  showColorVariants?: boolean;
  badge?: React.ReactNode;
}

const SimpleProductCard = ({
  product,
  onAddToCart,
  showOriginalPrice = false,
  showColorVariants = false,
  badge,
}: SimpleProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    checkWishlist();
  }, [product._id, user]);

  const checkWishlist = () => {
    if (user) {
      api.get("/auth/wishlist").then(({ data }) => {
        const ids = data.map((p: any) => p._id);
        setIsInWishlist(ids.includes(product._id));
      }).catch(() => {});
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
          await api.delete("/auth/wishlist/" + product._id);
          setIsInWishlist(false);
          showToast("Removed from wishlist", "success");
        } else {
          await api.post("/auth/wishlist", { productId: product._id });
          setIsInWishlist(true);
          showToast("Added to wishlist", "success");
        }
      } else {
        const saved = localStorage.getItem("wishlist");
        let ids = saved ? JSON.parse(saved) : [];
        if (isInWishlist) {
          ids = ids.filter((id: string) => id !== product._id);
          setIsInWishlist(false);
          showToast("Removed from wishlist", "success");
        } else {
          ids.push(product._id);
          setIsInWishlist(true);
          showToast("Added to wishlist", "success");
        }
        localStorage.setItem("wishlist", JSON.stringify(ids));
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update wishlist", "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  const discountPercent = product.discount || (product.originalPrice && product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group flex flex-col h-full">
      <div className="relative h-48 overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-700" onClick={() => navigate("/product/" + product._id)}>
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center">
            <FaShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600" />
          </div>
        ) : (
          <img src={product.images?.[0] || "/placeholder.jpg"} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={() => setImageError(true)} />
        )}
        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(); }} disabled={wishlistLoading} className={isInWishlist ? "absolute top-2 right-2 w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 bg-red-500 text-white" : "absolute top-2 right-2 w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/30"}>
          <FaHeart className={isInWishlist ? "w-3.5 h-3.5 text-white" : "w-3.5 h-3.5 text-gray-400 hover:text-red-500"} />
        </button>
        {badge && <div className="absolute top-2 left-2">{badge}</div>}
        {discountPercent > 0 && !badge && <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white rounded text-xs font-bold">-{discountPercent}%</div>}
        {product.stock === 0 && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"><span className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">Out of Stock</span></div>}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2" onClick={() => navigate("/product/" + product._id)}>{product.title}</h3>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar key={star} className={product.rating && star <= Math.round(product.rating) ? "w-3 h-3 text-yellow-400 fill-yellow-400" : "w-3 h-3 text-gray-300 dark:text-gray-600"} />
            ))}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">{product.rating ? "(" + product.rating.toFixed(1) + ")" : "(0)"}</span>
        </div>
        <div className="mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(product.price)}</span>
            {showOriginalPrice && product.originalPrice && product.originalPrice > product.price && <span className="text-xs text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>}
          </div>
        </div>

        <div className="mb-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
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
            <span className={`text-[10px] font-semibold ${
              product.stock === 0 ? 'text-red-700 dark:text-red-400' :
              product.stock <= 5 ? 'text-orange-700 dark:text-orange-400' :
              product.stock <= 20 ? 'text-yellow-700 dark:text-yellow-400' :
              'text-green-700 dark:text-green-400'
            }`}>
              {product.stock === 0 ? 'Out of Stock' : `Stock: ${product.stock}`}
            </span>
          </div>
        </div>

        {showColorVariants && (
          <div className="mb-2">
            {product.colorVariants && product.colorVariants.length > 0 ? (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">Colors:</span>
                {product.colorVariants.filter(v => v.isActive).slice(0, 3).map((variant, idx) => (
                  <span key={idx} className="text-[10px] text-gray-700 dark:text-gray-300">
                    {variant.colorName}{idx < Math.min(2, product.colorVariants.filter(v => v.isActive).length - 1) ? ',' : ''}
                  </span>
                ))}
                {product.colorVariants.filter(v => v.isActive).length > 3 && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">+{product.colorVariants.filter(v => v.isActive).length - 3} more</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">Color: Single</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex-grow"></div>
        <button onClick={() => onAddToCart(product)} disabled={product.stock === 0} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <FaShoppingCart className="w-3.5 h-3.5" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default SimpleProductCard;
