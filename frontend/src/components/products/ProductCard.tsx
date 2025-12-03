import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/constants";

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
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
      <div
        className="relative aspect-square overflow-hidden cursor-pointer group"
        onClick={() => navigate(`/product/${product._id}`)}
      >
        <img
          src={product.images?.[0] || "/placeholder.jpg"}
          alt={product.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <h3
          className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 cursor-pointer hover:text-[var(--root-color)] transition-colors"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-2">
          <span className="text-base sm:text-lg font-bold text-[var(--root-color)]">
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {product.stock}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <button
            onClick={() => navigate(`/product/${product._id}`)}
            className="w-full py-1.5 px-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            View
          </button>
          <button
            onClick={() => onAddToCart(product._id)}
            disabled={product.stock === 0}
            className="w-full py-1.5 px-2 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded text-xs hover:from-[var(--root-color)] hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
