import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchProducts } from "../../store/slices/productsSlice";
import { motion } from "framer-motion";

const FurnitureDoorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: products, loading } = useAppSelector(
    (state) => state.products
  );
  const [selectedCategory, setSelectedCategory] = useState(category);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    setSelectedCategory(category);
  }, [category]);

  const filteredProducts = selectedCategory
    ? products.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    : products;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4 text-center text-gray-500">
          Loading products...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {selectedCategory
              ? `${
                  selectedCategory.charAt(0).toUpperCase() +
                  selectedCategory.slice(1)
                } Collection`
              : "All Furniture"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Browse our premium furniture collection
          </p>
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🪑</div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No products found
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {selectedCategory
                ? `No products available in ${selectedCategory} category`
                : "No products available at the moment"}
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                  <img
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-5">
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-800 dark:text-white mb-2 line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg md:text-xl font-bold text-primary">
                      Rs. {product.price?.toLocaleString()}
                    </span>
                    <button className="bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary/90 transition-colors text-xs sm:text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FurnitureDoorPage;
