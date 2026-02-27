import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaStar, FaStarHalfAlt, FaRegStar, FaClock, FaBolt, FaFire } from "react-icons/fa";

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  image?: string;
  stock?: number;
  discount?: number;
  rating?: number;
  numReviews?: number;
  flashEndTime?: string;
  isFlashSale?: boolean;
  flashStock?: number;
  description?: string;
  colors?: string[];
  colorVariants?: Array<{
    colorName: string;
    colorCode: string;
    stock: number;
    isActive: boolean;
  }>;
}

interface FlashProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  colorScheme?: "blue" | "purple" | "orange";
}

const FlashProductCard = ({
  product,
  onAddToCart,
  colorScheme = "blue",
}: FlashProductCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const imageUrl = product.images?.[0] || product.image || "/placeholder.jpg";
  const isOutOfStock = product.stock === 0;

  // Function to render rating stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />);
    }

    // Half star
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />);
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="w-3.5 h-3.5 text-yellow-500" />);
    }

    return stars;
  };

  const colorSchemes = {
    blue: {
      gradient: "from-blue-600 via-indigo-600 to-purple-600",
      bg: "from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950",
      border: "border-blue-400 dark:border-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      button: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
      badge: "from-blue-500 to-indigo-500",
      timer: "bg-gradient-to-r from-blue-600 to-indigo-600",
      glow: "shadow-blue-500/30",
      accent: "bg-blue-500",
    },
    purple: {
      gradient: "from-purple-600 via-pink-600 to-rose-600",
      bg: "from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950 dark:via-pink-950 dark:to-rose-950",
      border: "border-purple-400 dark:border-purple-600",
      text: "text-purple-600 dark:text-purple-400",
      button: "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
      badge: "from-purple-500 to-pink-500",
      timer: "bg-gradient-to-r from-purple-600 to-pink-600",
      glow: "shadow-purple-500/30",
      accent: "bg-purple-500",
    },
    orange: {
      gradient: "from-orange-600 via-red-600 to-pink-600",
      bg: "from-orange-50 via-red-50 to-pink-50 dark:from-orange-950 dark:via-red-950 dark:to-pink-950",
      border: "border-orange-400 dark:border-orange-600",
      text: "text-orange-600 dark:text-orange-400",
      button: "from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700",
      badge: "from-orange-500 to-red-500",
      timer: "bg-gradient-to-r from-orange-600 to-red-600",
      glow: "shadow-orange-500/30",
      accent: "bg-orange-500",
    },
  };

  const colors = colorSchemes[colorScheme];

  useEffect(() => {
    if (product.flashEndTime) {
      const updateCountdown = () => {
        const now = new Date().getTime();
        const end = new Date(product.flashEndTime!).getTime();
        const diff = end - now;

        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      };

      updateCountdown();
      const timer = setInterval(updateCountdown, 1000);

      return () => clearInterval(timer);
    }
  }, [product.flashEndTime]);

  return (
    <div className={`relative bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 rounded-2xl overflow-hidden group h-full flex flex-col hover:shadow-2xl transition-all duration-500 border-2 ${colors.border} hover:scale-[1.02]`}>
      {/* Animated gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      
      {/* Glow effect on hover */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`}></div>

      {/* Top badges bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3">
        {/* Flash Badge - Animated */}
        <div className={`relative bg-gradient-to-r ${colors.badge} text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-110 transition-transform`}>
          <div className="relative">
            <FaBolt className="w-4 h-4 animate-pulse" />
            <div className="absolute inset-0 bg-yellow-300 blur-sm opacity-50 animate-ping"></div>
          </div>
          <span className="tracking-wider">FLASH SALE</span>
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>

        {/* Discount Badge - With glow */}
        {product.discount && (
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 blur-md opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
              -{product.discount}%
            </div>
          </div>
        )}
      </div>

      {/* Product Image Section - Compact */}
      <div className="relative h-48 flex items-center justify-center p-4 cursor-pointer overflow-hidden" onClick={() => navigate(`/product/${product._id}`)}>
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
            <FaShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600" />
          </div>
        ) : (
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
            <span className="bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg text-xs font-bold shadow-xl">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Section - Compact */}
      <div className="p-3 flex flex-col flex-1 relative">
        {/* Animated Timer - Compact */}
        {product.flashEndTime && timeLeft.hours + timeLeft.minutes + timeLeft.seconds > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <div className={`relative w-6 h-6 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-md`}>
                <FaClock className="w-3 h-3 text-white animate-pulse relative z-10" />
              </div>
              <span className={`text-xs font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>Ends in</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <div className="relative group/timer">
                <div className={`relative bg-gradient-to-br ${colors.gradient} text-white px-2 py-1.5 rounded-lg text-center min-w-[45px] shadow-md transform group-hover/timer:scale-105 transition-all duration-300`}>
                  <div className="text-base font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-[7px] opacity-90 font-semibold">HRS</div>
                </div>
              </div>
              <span className={`text-base font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>:</span>
              <div className="relative group/timer">
                <div className={`relative bg-gradient-to-br ${colors.gradient} text-white px-2 py-1.5 rounded-lg text-center min-w-[45px] shadow-md transform group-hover/timer:scale-105 transition-all duration-300`}>
                  <div className="text-base font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-[7px] opacity-90 font-semibold">MIN</div>
                </div>
              </div>
              <span className={`text-base font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>:</span>
              <div className="relative group/timer">
                <div className={`relative bg-gradient-to-br ${colors.gradient} text-white px-2 py-1.5 rounded-lg text-center min-w-[45px] shadow-md transform group-hover/timer:scale-105 transition-all duration-300`}>
                  <div className="text-base font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-[7px] opacity-90 font-semibold">SEC</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Info - Compact */}
        {product.flashStock && (
          <div className="mb-2">
            <div className={`relative bg-gradient-to-br ${colors.bg} rounded-lg p-2.5 border ${colors.border} shadow-md overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-5`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <FaFire className={`w-4 h-4 ${colors.text} animate-pulse`} />
                    <span className={`text-xs font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>Stock</span>
                  </div>
                  <span className={`text-xl font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>{product.flashStock}</span>
                </div>
                <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden shadow-inner">
                  <div 
                    className={`relative h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-700 shadow-md`}
                    style={{ width: `${Math.min((product.flashStock / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Title - Compact */}
        <h5 
          className={`text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 cursor-pointer hover:bg-gradient-to-r hover:${colors.gradient} hover:bg-clip-text hover:text-transparent transition-all duration-300 min-h-[2rem]`}
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.title}
        </h5>

        {/* Price and Rating - Compact */}
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="relative inline-block">
              <div className={`relative text-xl font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                ${product.price}
              </div>
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-gray-400 line-through font-medium">
                ${product.originalPrice}
              </div>
            )}
          </div>
          <div className="relative">
            <div className="relative bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 px-2 py-1.5 rounded-lg shadow-md border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center gap-0.5 mb-0.5">
                {renderStars(product.rating || 0)}
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {product.rating ? product.rating.toFixed(1) : "0.0"}
                </span>
                {product.numReviews && product.numReviews > 0 && (
                  <span className="text-[10px] text-gray-500">({product.numReviews})</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description - Compact */}
        {product.description && (
          <p className="text-gray-600 dark:text-gray-400 text-[11px] mb-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Color Variants - Compact */}
        {(product.colorVariants && product.colorVariants.length > 0) || (product.colors && product.colors.length > 0) ? (
          <div className="mb-2">
            <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Colors:</p>
            <div className="flex flex-wrap gap-1.5">
              {product.colorVariants && product.colorVariants.length > 0 ? (
                product.colorVariants.filter(v => v.isActive).slice(0, 5).map((variant, idx) => (
                  <div key={idx} className="relative group/variant">
                    <div 
                      className={`w-6 h-6 rounded-full border-2 shadow-sm hover:scale-110 transition-all cursor-pointer ${
                        variant.stock === 0 
                          ? 'border-gray-300 dark:border-gray-600 opacity-40' 
                          : 'border-white dark:border-gray-700 hover:shadow-md'
                      }`}
                      style={{ backgroundColor: variant.colorCode }}
                      title={`${variant.colorName} - Stock: ${variant.stock}`}
                    />
                    {variant.stock === 0 && (
                      <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-red-600">✕</span>
                      </div>
                    )}
                    {variant.stock > 0 && variant.stock <= 5 && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800 animate-pulse"></div>
                    )}
                  </div>
                ))
              ) : (
                product.colors?.slice(0, 5).map((color, idx) => (
                  <div 
                    key={idx} 
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-700 shadow-sm hover:scale-110 hover:shadow-md transition-all cursor-pointer" 
                    style={{ backgroundColor: color }}
                  />
                ))
              )}
              {((product.colorVariants && product.colorVariants.filter(v => v.isActive).length > 5) || (product.colors && product.colors.length > 5)) && (
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer">
                  <span className="text-[8px] font-bold text-gray-600 dark:text-gray-400">
                    +{(product.colorVariants?.filter(v => v.isActive).length || product.colors?.length || 0) - 5}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Regular Stock - Compact */}
        {!product.flashStock && product.stock && product.stock > 0 && (
          <div className="mb-2">
            <div className={`rounded-lg p-2 border shadow-sm ${product.stock <= 5 ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-300 dark:border-red-700' : product.stock <= 20 ? 'bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-300 dark:border-orange-700' : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'}`}>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${product.stock <= 5 ? 'bg-red-500 animate-pulse' : product.stock <= 20 ? 'bg-orange-500' : 'bg-green-500'} shadow-md`}></div>
                <span className={`text-[10px] font-bold ${product.stock <= 5 ? 'text-red-700 dark:text-red-400' : product.stock <= 20 ? 'text-orange-700 dark:text-orange-400' : 'text-green-700 dark:text-green-400'}`}>
                  {product.stock} in stock
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Add to Cart Button - Compact */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(product);
          }}
          disabled={isOutOfStock}
          className={`relative w-full py-2.5 rounded-lg text-xs font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${colors.button} hover:shadow-xl hover:scale-105 active:scale-95 overflow-hidden group/btn`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
          
          <FaShoppingCart className="w-3.5 h-3.5 relative z-10 group-hover/btn:rotate-12 transition-transform duration-300" />
          <span className="relative z-10 tracking-wide">ADD TO CART</span>
        </button>
      </div>
    </div>
  );
};

export default FlashProductCard;
