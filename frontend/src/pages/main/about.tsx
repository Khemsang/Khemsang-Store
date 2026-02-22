import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api, bannersApi } from "../../services/api";
import {
  FaAward,
  FaUsers,
  FaHeart,
  FaShieldAlt,
  FaStar,
  FaHandshake,
  FaLeaf,
  FaTruck,
} from "react-icons/fa";

interface AboutData {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  heroSmallImage1: string;
  heroSmallImage2: string;
  yearsOfExperience: number;
  happyCustomers: number;
  whyChooseTitle: string;
  whyChooseDescription: string;
  galleryImages: string[];
  ctaTitle: string;
  ctaDescription: string;
}

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
  order: number;
}

const AboutUs: React.FC = () => {
  const navigate = useNavigate();
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [heroBanner, setHeroBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
    fetchHeroBanner();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/about");
      setAboutData(data);
    } catch (error: any) {
      console.error("Error fetching about data:", error);
      if (error.response?.status === 404) {
        setAboutData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHeroBanner = async () => {
    try {
      const { data } = await bannersApi.getAll();
      // Filter active hero banners and get the first one
      const activeBanners = data.filter(
        (banner: Banner) => banner.isActive && banner.position === "hero"
      );
      if (activeBanners.length > 0) {
        // Get the first active hero banner
        setHeroBanner(activeBanners[0]);
      }
    } catch (error: any) {
      console.error("Error fetching hero banner:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            About Page Not Set Up Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The About page content hasn't been added yet. Please contact the
            administrator.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: FaAward,
      title: "Premium Quality",
      description: "Top-notch products with attention to every detail",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: FaUsers,
      title: "Expert Team",
      description: "Skilled professionals dedicated to excellence",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: FaLeaf,
      title: "Eco-Friendly",
      description: "Sustainable materials and responsible sourcing",
      color: "from-green-500 to-green-600",
    },
    {
      icon: FaTruck,
      title: "Fast Delivery",
      description: "Quick and safe delivery to your doorstep",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: FaShieldAlt,
      title: "Warranty",
      description: "Comprehensive warranty on all products",
      color: "from-red-500 to-red-600",
    },
    {
      icon: FaStar,
      title: "Top Rated",
      description: "Highly rated by thousands of customers",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: FaHandshake,
      title: "Trust & Support",
      description: "24/7 customer support and assistance",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: FaHeart,
      title: "Made with Love",
      description: "Every product crafted with passion and care",
      color: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <section className="w-full bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 overflow-hidden">
      {/* Hero Section with Banner Background */}
      <div className="relative py-20 md:py-28 lg:py-32">
        {/* Banner Background Image */}
        {heroBanner && (
          <div className="absolute inset-0 z-0">
            <img
              src={heroBanner.image}
              alt={heroBanner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-900/50 to-pink-900/50 backdrop-blur-sm"></div>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse z-[1]"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000 z-[1]"></div>

        <div className="container px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Images */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Main Image */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                <img
                  src={aboutData.heroImage}
                  alt="Modern furniture showroom"
                  className="relative rounded-3xl shadow-2xl w-full h-[400px] md:h-[500px] object-cover border-4 border-white/20"
                />
              </div>

              {/* Small Images Grid */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                {aboutData.heroSmallImage1 && (
                  <img
                    src={aboutData.heroSmallImage1}
                    alt="Furniture detail"
                    className="rounded-2xl shadow-lg h-32 md:h-40 w-full object-cover hover:scale-105 transition-transform duration-300 border-2 border-white/20"
                  />
                )}
                {aboutData.heroSmallImage2 && (
                  <img
                    src={aboutData.heroSmallImage2}
                    alt="Craftsmanship"
                    className="rounded-2xl shadow-lg h-32 md:h-40 w-full object-cover hover:scale-105 transition-transform duration-300 border-2 border-white/20"
                  />
                )}
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-lg">
                <span className="text-2xl">🏠</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  About Us
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                <span
                  className={`${
                    heroBanner
                      ? "text-white drop-shadow-2xl"
                      : "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent"
                  }`}
                >
                  {aboutData.heroTitle}
                </span>
              </h1>

              <p
                className={`text-lg md:text-xl leading-relaxed ${
                  heroBanner
                    ? "text-white/95 drop-shadow-lg"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {aboutData.heroDescription}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-3 px-6 py-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {aboutData.yearsOfExperience}+
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Years of
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      Experience
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-6 py-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {aboutData.happyCustomers >= 1000
                      ? `${Math.floor(aboutData.happyCustomers / 1000)}K+`
                      : `${aboutData.happyCustomers}+`}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Happy
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      Customers
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/products")}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300"
              >
                <span>Explore Collection</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 md:py-28 bg-white dark:bg-gray-800">
        <div className="container px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
              <span className="text-2xl">✨</span>
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                {aboutData.whyChooseTitle}
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              {aboutData.whyChooseDescription}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>

                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="py-20 md:py-28 bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
        <div className="container px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full mb-6 shadow-lg">
              <span className="text-2xl">📸</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Our Work
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                See Our Creations
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {aboutData.galleryImages
              .filter((img) => img)
              .map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-48 md:h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-semibold">View Details</p>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 md:py-28">
        <div className="container px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-3xl p-12 md:p-16 lg:p-20 text-center text-white shadow-2xl overflow-hidden"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6">
                {aboutData.ctaTitle}
              </h2>
              <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                {aboutData.ctaDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/products")}
                  className="group px-8 py-4 bg-white text-purple-600 rounded-2xl hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>Shop Now</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-2xl hover:bg-white hover:text-purple-600 transition-all duration-300 font-bold text-lg"
                >
                  Sign Up Now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};

export default AboutUs;
