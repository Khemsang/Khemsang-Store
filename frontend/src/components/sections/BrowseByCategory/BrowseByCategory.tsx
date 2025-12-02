import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../../services/api";
import {
  FaCouch,
  FaChair,
  FaBed,
  FaDoorOpen,
  FaBox,
  FaLightbulb,
  FaTv,
  FaUtensils,
  FaBath,
  FaWarehouse,
  FaHome,
  FaPalette,
  FaTools,
  FaTshirt,
  FaShoePrints,
  FaGlasses,
  FaHatCowboy,
  FaGem,
  FaMobileAlt,
  FaLaptop,
  FaHeadphones,
  FaCamera,
  FaGamepad,
  FaBook,
  FaMusic,
  FaDumbbell,
  FaBicycle,
  FaFootballBall,
  FaBaby,
  FaPaw,
  FaLeaf,
  FaCoffee,
  FaWineGlass,
  FaBirthdayCake,
  FaGift,
  FaUmbrella,
  FaSuitcase,
  FaCar,
  FaPlane,
  FaPaintBrush,
} from "react-icons/fa";

interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
}

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  const icons: any = {
    FaCouch,
    FaChair,
    FaBed,
    FaDoorOpen,
    FaLightbulb,
    FaTv,
    FaUtensils,
    FaBath,
    FaWarehouse,
    FaHome,
    FaPalette,
    FaTools,
    FaBox,
    FaTshirt,
    FaShoePrints,
    FaGlasses,
    FaHatCowboy,
    FaGem,
    FaMobileAlt,
    FaLaptop,
    FaHeadphones,
    FaCamera,
    FaGamepad,
    FaBook,
    FaMusic,
    FaDumbbell,
    FaBicycle,
    FaFootballBall,
    FaBaby,
    FaPaw,
    FaLeaf,
    FaCoffee,
    FaWineGlass,
    FaBirthdayCake,
    FaGift,
    FaUmbrella,
    FaSuitcase,
    FaCar,
    FaPlane,
    FaPaintBrush,
  };
  return icons[iconName] || FaBox;
};

const BrowseByCategory: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/categories");
      setCategories(data.filter((cat: Category) => cat.isActive));
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto text-center text-gray-500 dark:text-gray-400">
          Loading categories...
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Browse by <span className="text-[var(--root-color)]">Category</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg px-4">
            Explore our wide range of furniture categories
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {categories.map((category, index) => {
            const IconComponent = getIconComponent(category.icon);
            return (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => handleCategoryClick(category.name)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--root-color)] to-purple-600 aspect-square shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center justify-center p-3 sm:p-4 md:p-6">
                  <IconComponent className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg text-center leading-tight">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-white/80 text-[10px] sm:text-xs text-center mt-1 sm:mt-2 line-clamp-2 hidden sm:block">
                      {category.description}
                    </p>
                  )}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/20 backdrop-blur-sm rounded-full p-1 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BrowseByCategory;
