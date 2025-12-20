import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../../services/api";
import { ViewAllButton } from "../../common";
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
  image?: string;
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
          {categories.slice(0, 12).map((category, index) => {
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
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--root-color)] to-purple-600 aspect-square shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center">
                  {category.image ? (
                    <>
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                        <h3 className="text-white font-bold text-[10px] sm:text-xs md:text-sm text-center leading-tight">
                          {category.name}
                        </h3>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 sm:p-3">
                      <IconComponent className="text-2xl sm:text-3xl md:text-4xl text-white mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300" />
                      <h3 className="text-white font-bold text-[10px] sm:text-xs md:text-sm text-center leading-tight">
                        {category.name}
                      </h3>
                    </div>
                  )}
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-white/20 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
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

        {/* More Categories Button */}
        {categories.length > 12 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <ViewAllButton
              to="/products"
              label={`View All Categories (${categories.length})`}
              variant="primary"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BrowseByCategory;
