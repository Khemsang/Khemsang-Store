import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaShoppingCart,
  FaHeart,
  FaStar,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description?: string;
  rating?: number;
  numReviews?: number;
  stock?: number;
  sizes?: string[];
  colors?: string[];
}

interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickView = ({ product, isOpen, onClose }: QuickViewProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const { addToCart } = useCart();
  const { showToast } = useToast();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`${product.title} added to cart!`, "success");
    onClose();
  };

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <FaTimes className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Images */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={product.images[selectedImage] || "/placeholder.jpg"}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                      -{discount}%
                    </span>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === idx
                            ? "border-purple-500 ring-2 ring-purple-300"
                            : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.title}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < (product.rating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.numReviews || 0} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-purple-600">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      Rs. {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                  {product.description || "No description available."}
                </p>

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                      Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                            selectedSize === size
                              ? "border-purple-500 bg-purple-50 text-purple-600"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            selectedColor === color
                              ? "ring-2 ring-purple-500 ring-offset-2"
                              : ""
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-4 mb-6">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Quantity
                  </label>
                  <div className="flex items-center border-2 border-gray-200 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FaMinus className="w-3 h-3" />
                    </button>
                    <span className="px-4 py-2 font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                  {product.stock !== undefined && (
                    <span className="text-sm text-gray-500">
                      {product.stock} in stock
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    <FaShoppingCart />
                    Add to Cart
                  </button>
                  <button className="p-3 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all group">
                    <FaHeart className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickView;
