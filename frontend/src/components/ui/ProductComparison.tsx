import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaStar, FaShoppingCart, FaTrash } from "react-icons/fa";
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
  brand?: string;
  category?: string;
  sizes?: string[];
  colors?: string[];
}

interface ProductComparisonProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (productId: string) => void;
}

const ProductComparison = ({
  products,
  isOpen,
  onClose,
  onRemove,
}: ProductComparisonProps) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    showToast(`${product.title} added to cart!`, "success");
  };

  const compareFields = [
    {
      key: "price",
      label: "Price",
      render: (p: Product) => `Rs. ${p.price.toLocaleString()}`,
    },
    {
      key: "originalPrice",
      label: "Original Price",
      render: (p: Product) =>
        p.originalPrice ? `Rs. ${p.originalPrice.toLocaleString()}` : "-",
    },
    {
      key: "rating",
      label: "Rating",
      render: (p: Product) => (
        <div className="flex items-center gap-1">
          <FaStar className="text-yellow-400" />
          <span>{p.rating?.toFixed(1) || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "numReviews",
      label: "Reviews",
      render: (p: Product) => p.numReviews || 0,
    },
    {
      key: "stock",
      label: "Stock",
      render: (p: Product) => (
        <span
          className={p.stock && p.stock > 0 ? "text-green-600" : "text-red-600"}
        >
          {p.stock && p.stock > 0 ? `${p.stock} available` : "Out of stock"}
        </span>
      ),
    },
    { key: "brand", label: "Brand", render: (p: Product) => p.brand || "-" },
    {
      key: "category",
      label: "Category",
      render: (p: Product) => p.category || "-",
    },
    {
      key: "sizes",
      label: "Sizes",
      render: (p: Product) => p.sizes?.join(", ") || "-",
    },
    {
      key: "colors",
      label: "Colors",
      render: (p: Product) =>
        p.colors?.length ? (
          <div className="flex gap-1">
            {p.colors.map((c, i) => (
              <span
                key={i}
                className="w-5 h-5 rounded-full border"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        ) : (
          "-"
        ),
    },
  ];

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
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Compare Products ({products.length})
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-auto max-h-[calc(90vh-100px)]">
              {products.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 text-lg">
                    No products to compare
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Add products to compare them side by side
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-4 text-left bg-gray-50 dark:bg-gray-700/50 sticky left-0 z-10 min-w-[150px]">
                        Feature
                      </th>
                      {products.map((product) => (
                        <th key={product._id} className="p-4 min-w-[250px]">
                          <div className="relative">
                            <button
                              onClick={() => onRemove(product._id)}
                              className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                            <img
                              src={product.images[0] || "/placeholder.jpg"}
                              alt={product.title}
                              className="w-32 h-32 object-cover rounded-xl mx-auto mb-3"
                            />
                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                              {product.title}
                            </h3>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compareFields.map((field, idx) => (
                      <tr
                        key={field.key}
                        className={
                          idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-700/30" : ""
                        }
                      >
                        <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-inherit">
                          {field.label}
                        </td>
                        {products.map((product) => (
                          <td
                            key={product._id}
                            className="p-4 text-center text-gray-600 dark:text-gray-400"
                          >
                            {field.render(product)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* Add to Cart Row */}
                    <tr>
                      <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800">
                        Action
                      </td>
                      {products.map((product) => (
                        <td key={product._id} className="p-4 text-center">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                          >
                            <FaShoppingCart />
                            Add to Cart
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductComparison;
