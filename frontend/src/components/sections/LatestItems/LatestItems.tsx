import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchProducts } from "../../../store/slices/productsSlice";

const LatestItems: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: products, loading } = useAppSelector(
    (state) => state.products
  );
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // Show only latest 8 items (sorted by newest first)
  const latestProducts = products
    .slice()
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 8);

  const itemsPerSlide = 4;
  const totalSlides = Math.ceil(latestProducts.length / itemsPerSlide);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (latestProducts.length <= itemsPerSlide) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [latestProducts.length, totalSlides, itemsPerSlide]);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto text-center text-gray-500 dark:text-gray-400">
          Loading latest items...
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 bg-white dark:bg-gray-800" ref={ref}>
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
        >
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full mb-3">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                Just Arrived
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Latest Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Check out our newest arrivals
            </p>
          </div>

          {/* Slider Container */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-4"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div
                  key={slideIndex}
                  className="min-w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4"
                >
                  {latestProducts
                    .slice(
                      slideIndex * itemsPerSlide,
                      (slideIndex + 1) * itemsPerSlide
                    )
                    .map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={controls}
                        variants={{
                          visible: {
                            opacity: 1,
                            y: 0,
                            transition: { delay: index * 0.1, duration: 0.5 },
                          },
                        }}
                        onClick={() => navigate(`/product/${item._id}`)}
                        className="group bg-white dark:bg-gray-700 rounded-lg md:rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-600 hover:border-green-500"
                      >
                        <div className="relative h-28 sm:h-36 md:h-48 bg-gray-100 dark:bg-gray-600 overflow-hidden">
                          <img
                            src={item.images?.[0] || "/placeholder.jpg"}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold shadow-lg flex items-center gap-0.5 md:gap-1">
                            <svg
                              className="w-2.5 h-2.5 md:w-3 md:h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            New
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="p-2 md:p-3">
                          <h3 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white mb-0.5 md:mb-1 line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 mb-1 md:mb-2 line-clamp-1">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm md:text-lg font-bold text-[var(--root-color)]">
                              Rs. {item.price?.toLocaleString()}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/product/${item._id}`);
                              }}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-[10px] md:text-xs font-medium shadow-md"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          {latestProducts.length > itemsPerSlide && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === index
                      ? "w-8 bg-gradient-to-r from-green-500 to-emerald-600"
                      : "w-2 bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
          )}

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            variants={{
              visible: {
                opacity: 1,
                y: 0,
                transition: { delay: 0.8, duration: 0.5 },
              },
            }}
            className="text-center mt-8"
          >
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>View All Products</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default LatestItems;
