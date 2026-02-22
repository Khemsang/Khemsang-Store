import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../../services/api";
import ViewAllButton from "../../common/ViewAllButton";
import Loading from "../../common/Loading";
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
    return <Loading text="Loading categories..." size="sm" variant="minimal" />;
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 px-4 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-lg">
              Shop by Category
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Our <span className="text-blue-600">Collections</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg px-4 max-w-2xl mx-auto">
            Find the perfect products from our carefully curated categories
          </p>
        </motion.div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
          {categories.slice(0, 12).map((category, index) => {
            const IconComponent = getIconComponent(category.icon);
            return (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(category.name)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 aspect-square shadow-lg hover:shadow-2xl transition-all duration-500">
                  {category.image ? (
                    <>
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-colors duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                        <h3 className="text-white font-bold text-[10px] sm:text-xs drop-shadow-lg line-clamp-2">
                          {category.name}
                        </h3>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-2 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-500">
                      <div className="mb-2 p-2 sm:p-3 bg-white dark:bg-gray-600 rounded-xl shadow-md group-hover:shadow-xl group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                        <IconComponent className="text-xl sm:text-2xl text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-500" />
                      </div>
                      <h3 className="text-gray-800 dark:text-gray-200 group-hover:text-white font-bold text-[10px] sm:text-xs text-center leading-tight transition-colors duration-500 line-clamp-2 px-1">
                        {category.name}
                      </h3>
                    </div>
                  )}
                  
                  {/* Hover Arrow */}
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-lg">
                    <svg
                      className="w-3 h-3 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <ViewAllButton
              to="/products"
              label={`View All ${categories.length} Categories`}
              variant="primary"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BrowseByCategory;
