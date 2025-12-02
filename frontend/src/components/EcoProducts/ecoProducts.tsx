import { useState, useEffect } from "react";
import { api } from "../../services/api";

interface Category {
  name: string;
  count: number;
}

const EcoProductSlider = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const ITEMS_PER_LOAD = 12;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/products");

      // Get unique categories with product count
      const categoryMap = new Map<string, number>();
      data.forEach((product: any) => {
        const count = categoryMap.get(product.category) || 0;
        categoryMap.set(product.category, count + 1);
      });

      const uniqueCategories = Array.from(categoryMap.entries()).map(
        ([name, count]) => ({ name, count })
      );

      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (visibleCount >= categories.length) {
      setVisibleCount(ITEMS_PER_LOAD);
    } else {
      setVisibleCount(categories.length);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto text-center text-gray-500">
          Loading categories...
        </div>
      </section>
    );
  }

  const visibleCategories = categories.slice(0, visibleCount);

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
          Browse by Category
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Explore our wide range of product categories
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {visibleCategories.map((category, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group border border-gray-200 dark:border-gray-600"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 mb-4 bg-gradient-to-br from-[var(--root-color)] to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.count} product{category.count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          ))}
        </div>

        {categories.length > ITEMS_PER_LOAD && (
          <div className="text-center mt-10">
            <button
              onClick={handleToggle}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              {visibleCount >= categories.length
                ? "Show Less"
                : "View All Categories"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default EcoProductSlider;
