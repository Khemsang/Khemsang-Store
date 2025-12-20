import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../../services/api";
import { FaClock, FaArrowRight } from "react-icons/fa";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  discount?: number;
}

const RecentlyViewed = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = async () => {
    try {
      const saved = localStorage.getItem("recentlyViewed");
      const ids: string[] = saved ? JSON.parse(saved) : [];

      if (ids.length > 0) {
        const { data } = await api.get("/products");
        const recentProducts = ids
          .map((id) => data.find((p: Product) => p._id === id))
          .filter(Boolean)
          .slice(0, 6);
        setProducts(recentProducts);
      }
    } catch (error) {
      console.error("Error loading recently viewed:", error);
    }
  };

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price - (price * discount) / 100;
  };

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FaClock className="text-2xl text-[var(--root-color)]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recently Viewed
            </h2>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("recentlyViewed");
              setProducts([]);
            }}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Clear History
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/product/${product._id}`)}
              className="bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.images?.[0] || "/placeholder.png"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <p className="text-xs text-[var(--root-color)] font-medium mb-1">
                  {product.category}
                </p>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-[var(--root-color)] transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                  Rs.{" "}
                  {getDiscountedPrice(
                    product.price,
                    product.discount
                  ).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;

// Helper function to add product to recently viewed
export const addToRecentlyViewed = (productId: string) => {
  const saved = localStorage.getItem("recentlyViewed");
  let ids: string[] = saved ? JSON.parse(saved) : [];

  // Remove if already exists
  ids = ids.filter((id) => id !== productId);

  // Add to beginning
  ids.unshift(productId);

  // Keep only last 10
  ids = ids.slice(0, 10);

  localStorage.setItem("recentlyViewed", JSON.stringify(ids));
};
