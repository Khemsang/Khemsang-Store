import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { bannersApi } from "../../services/api";

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
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await bannersApi.getAll();
        setBanners(
          data.filter((b: Banner) => b.isActive && b.position === "hero")
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchBanners();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners, paused]);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const next = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const currentBanner = banners[current];

  const slide = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slider */}
      {banners.length > 0 ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === current
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105"
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-900/40 to-pink-900/40"></div>
        </div>
      ) : (
        // Animated blobs
        <div className="absolute inset-0 z-[1] overflow-hidden">
          {[
            "-top-40 -right-40",
            "-bottom-40 -left-40",
            "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob`}
              style={{
                animationDelay: `${i * 2}s`,
                backgroundColor:
                  i === 0 ? "#a78bfa" : i === 1 ? "#60a5fa" : "#f472b6",
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Navigation */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </>
      )}

      {/* Content */}
      <div className="relative z-10 text-center max-w-7xl mx-auto px-4 py-12 sm:py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full mb-6"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Welcome to Khemsang Store
          </span>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.h1
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className={`text-4xl sm:text-6xl font-extrabold mb-4 ${
              currentBanner
                ? "text-white drop-shadow-2xl"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {currentBanner ? (
              <>
                {currentBanner.title}
                {currentBanner.subtitle && (
                  <span className="block text-3xl mt-2 text-white/90">
                    {currentBanner.subtitle}
                  </span>
                )}
              </>
            ) : (
              <>
                Discover Your
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Perfect Style
                </span>
              </>
            )}
          </motion.h1>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`desc-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`text-lg mb-8 max-w-3xl mx-auto ${
              currentBanner
                ? "text-white/95"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {currentBanner?.description ||
              "Explore our curated collection of premium products crafted with care and delivered with love"}
          </motion.p>
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => navigate(currentBanner?.buttonLink || "/products")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-transform"
          >
            {currentBanner?.buttonText || "Shop Now"}
          </button>
          <button
            onClick={() => navigate("/about")}
            className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-xl font-bold hover:scale-105 transition-transform"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-3 rounded-full transition-all ${
                i === current
                  ? "w-10 bg-white"
                  : "w-3 bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 flex flex-col items-center gap-2"
      >
        <span className="text-sm font-medium">Scroll to explore</span>
        <svg
          className="w-6 h-6 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>

      <style>{`
        @keyframes blob {
          0%,100%{transform:translate(0,0) scale(1);}
          33%{transform:translate(30px,-50px) scale(1.1);}
          66%{transform:translate(-20px,20px) scale(0.9);}
        }
        .animate-blob{animation:blob 7s infinite;}
      `}</style>
    </section>
  );
};

export default HeroSection;
