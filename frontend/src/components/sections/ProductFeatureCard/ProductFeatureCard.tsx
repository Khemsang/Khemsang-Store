import React from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../../../context/ToastContext";

interface ProductFeatureCardProps {
  _id?: string;
  title?: string;
  description?: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  productId?: string;
}

const ProductFeatureCard: React.FC<ProductFeatureCardProps> = ({
  _id,
  title = "Product",
  image = "/placeholder.jpg",
  price = 0,
  originalPrice,
  discount = 0,
  productId,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (productId) {
      addToCart({ _id: productId, title, price, images: [image] }, 1);
      showToast(`${title} added to cart!`, "success");
    } else {
      navigate(`/featured/${_id}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all group h-full flex flex-col">
      <div
        className="relative aspect-square cursor-pointer overflow-hidden flex-shrink-0"
        onClick={() => navigate(`/featured/${_id}`)}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <span className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
          <FaStar className="w-3 h-3" />
          Featured
        </span>
        {discount > 0 && (
          <span className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3
          className="font-semibold text-gray-900 dark:text-white text-sm h-10 line-clamp-2 mb-2 cursor-pointer hover:text-purple-600"
          onClick={() => navigate(`/featured/${_id}`)}
        >
          {title}
        </h3>
        <div className="flex items-center justify-between mb-3 mt-auto">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-purple-600">
              Rs. {price.toLocaleString()}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-gray-500 line-through">
                Rs. {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
        >
          {productId ? "Add to Cart" : "View Details"}
        </button>
      </div>
    </div>
  );
};

export default ProductFeatureCard;
