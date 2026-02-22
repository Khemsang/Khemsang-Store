import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { bannersApi } from "../../../services/api";
import { ShoppingBag, TrendingUp, Zap } from "lucide-react";

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  position: "hero" | "secondary" | "footer";
  isActive: boolean;
}

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await bannersApi.getAll();
        const heroBanners = data.filter(
          (b: Banner) => b.isActive && b.position === "hero"
        );
        setBanners(heroBanners);
      } catch (err) {
        console.error("Error fetching banners:", err);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length, paused]);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  const prev = () => setCurrent((p) => (p - 1 + banners.length) % banners.length);
  const next = () => setCurrent((p) => (p + 1) % banners.length);

  const currentBanner = banners[current];

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-gray-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background Image Slider */}
      {banners.length > 0 && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ 
                duration: 1,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              className="absolute inset-0"
            >
              <motion.img
                src={currentBanner?.image}
                alt={currentBanner?.title}
                className="w-full h-full object-cover"
                initial={{ scale: 1 }}
                animate={{ scale: 1.03 }}
                transition={{ 
                  duration: 7,
                  ease: "linear"
                }}
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Simple Background Pattern (when no banners) */}
      {banners.length === 0 && (
        <div className="absolute inset-0 overflow-hidden z-[1]">
          <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 transition-all duration-300 hover:scale-110 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 transition-all duration-300 hover:scale-110 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-6 md:mb-8"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
            </span>
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            <span className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
              Welcome to Khemsang Store
            </span>
          </motion.div>

          {/* Main Title */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={current}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ 
                duration: 0.8,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 md:mb-6 leading-tight"
            >
              {currentBanner ? (
                <span className="text-white drop-shadow-2xl">
                  {currentBanner.title}
                  {currentBanner.subtitle && (
                    <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-4 text-white/95 font-bold">
                      {currentBanner.subtitle}
                    </span>
                  )}
                </span>
              ) : (
                <>
                  <span className="text-gray-900 dark:text-white">Discover Your</span>
                  <span className="block text-blue-600 dark:text-blue-500 mt-2">
                    Perfect Style
                  </span>
                </>
              )}
            </motion.h1>
          </AnimatePresence>

          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${current}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ 
                duration: 0.8,
                delay: 0.2,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              className={`text-base md:text-xl lg:text-2xl mb-8 md:mb-12 max-w-4xl mx-auto font-medium ${
                currentBanner
                  ? "text-white drop-shadow-lg"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {currentBanner?.description ||
                "Explore our curated collection of premium products crafted with care"}
            </motion.p>
          </AnimatePresence>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center"
          >
            <button
              onClick={() => navigate(currentBanner?.buttonLink || "/products")}
              className="group relative px-8 py-4 md:px-12 md:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base md:text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                {currentBanner?.buttonText || "Shop Now"}
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            
            <button
              onClick={() => navigate("/about")}
              className="px-8 py-4 md:px-12 md:py-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold text-base md:text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500"
            >
              <span className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                Learn More
              </span>
            </button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-3 md:gap-4 justify-center mt-8 md:mt-12"
          >
            {["Free Shipping", "24/7 Support", "Secure Payment"].map((feature, i) => (
              <div
                key={i}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-semibold ${
                  currentBanner
                    ? "bg-white/20 backdrop-blur-sm text-white border border-white/30"
                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                }`}
              >
                {feature}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Slide Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 md:bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-10 bg-white shadow-lg"
                  : "w-2.5 bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
