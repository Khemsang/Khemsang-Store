import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTh, FaArrowRight } from "react-icons/fa";
import { api } from "../../services/api";

interface Category {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  productCount?: number;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <FaTh className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Shop by Category
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Browse our wide range of product categories
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <FaTh className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No Categories Available
            </h2>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category._id}
                onClick={() => navigate(`/products?category=${category.name}`)}
                className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaTh className="w-16 h-16 text-purple-300" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-bold text-white text-lg mb-1 group-hover:text-purple-300 transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-white/70 text-sm line-clamp-1">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Explore</span>
                    <FaArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
