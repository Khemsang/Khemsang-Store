import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/api";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import ViewAllButton from "../../common/ViewAllButton";
import {
  FaShoppingBag,
  FaArrowRight,
  FaHeart,
  FaEye,
  FaTruck,
  FaShieldAlt,
  FaHeadset,
  FaMedal,
  FaStar,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaRegHeart,
  FaShoppingCart,
  FaExpand,
} from "react-icons/fa";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  discount?: number;
  stock?: number;
  rating?: number;
  numReviews?: number;
  createdAt?: string;
  description?: string;
}

interface AboutData {
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  heroSmallImage1: string;
  heroSmallImage2: string;
  yearsOfExperience: number;
  happyCustomers: number;
  bestProducts: Product[];
  bestProductsTitle: string;
  bestProductsDescription: string;
}

interface Brand {
  _id: string;
  name: string;
  logo: string;
  website?: string;
}

const StoreHighlights: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [hoveredImageIndex, setHoveredImageIndex] = useState<{
    [key: string]: number;
  }>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );
  const [quickViewImageIndex, setQuickViewImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    fetchAboutData();
    fetchBrands();
    // Load wishlist from localStorage
    const saved = localStorage.getItem("wishlist");
    if (saved) setWishlist(JSON.parse(saved));
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/about");
      setAboutData(data);
    } catch (err) {
      console.error("Error fetching about data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const { data } = await api.get("/brands");
      setBrands(data);
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price - (price * discount) / 100;
  };

  const isNewProduct = (createdAt?: string) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays <= 14; // New if created within 14 days
  };

  const toggleWishlist = (productId: string) => {
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    if (newWishlist.includes(productId)) {
      success("Added to wishlist!");
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      navigate("/login", { state: { from: "/" } });
      return;
    }
    try {
      setAddingToCart(product._id);
      await addToCart(product._id, 1);
      success("Added to cart!");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleImageHover = (productId: string, index: number) => {
    setHoveredImageIndex((prev) => ({ ...prev, [productId]: index }));
  };

  const features = [
    {
      icon: FaTruck,
      title: "Free Delivery",
      desc: "On orders over Rs.5000",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: FaShieldAlt,
      title: "Secure Payment",
      desc: "100% protected",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: FaHeadset,
      title: "24/7 Support",
      desc: "Dedicated support",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FaMedal,
      title: "Best Quality",
      desc: "Premium products",
      color: "from-orange-500 to-red-500",
    },
  ];

  if (loading || !aboutData) return null;

  return (
    <section className="relative overflow-hidden">
      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setQuickViewProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Image Gallery */}
                <div className="relative bg-gray-100 dark:bg-gray-700 p-6">
                  <div className="relative aspect-square rounded-2xl overflow-hidden">
                    <img
                      src={
                        quickViewProduct.images?.[quickViewImageIndex] ||
                        "/placeholder.png"
                      }
                      alt={quickViewProduct.name}
                      className="w-full h-full object-cover"
                    />
                    {quickViewProduct.images &&
                      quickViewProduct.images.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setQuickViewImageIndex(
                                (prev) =>
                                  (prev - 1 + quickViewProduct.images.length) %
                                  quickViewProduct.images.length
                              )
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <FaChevronLeft />
                          </button>
                          <button
                            onClick={() =>
                              setQuickViewImageIndex(
                                (prev) =>
                                  (prev + 1) % quickViewProduct.images.length
                              )
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <FaChevronRight />
                          </button>
                        </>
                      )}
                  </div>
                  {/* Thumbnails */}
                  {quickViewProduct.images &&
                    quickViewProduct.images.length > 1 && (
                      <div className="flex gap-2 mt-4 justify-center">
                        {quickViewProduct.images.slice(0, 5).map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setQuickViewImageIndex(idx)}
                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              quickViewImageIndex === idx
                                ? "border-[var(--root-color)] scale-105"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-6 md:p-8 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-[var(--root-color)] uppercase">
                      {quickViewProduct.category}
                    </span>
                    {isNewProduct(quickViewProduct.createdAt) && (
                      <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                        NEW
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {quickViewProduct.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-sm ${
                            i < Math.floor(quickViewProduct.rating || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({quickViewProduct.numReviews || 0} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">
                      Rs.{" "}
                      {getDiscountedPrice(
                        quickViewProduct.price,
                        quickViewProduct.discount
                      ).toLocaleString()}
                    </span>
                    {quickViewProduct.discount &&
                      quickViewProduct.discount > 0 && (
                        <>
                          <span className="text-xl text-gray-400 line-through">
                            Rs. {quickViewProduct.price.toLocaleString()}
                          </span>
                          <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-lg">
                            -{quickViewProduct.discount}%
                          </span>
                        </>
                      )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2 mb-4">
                    {(quickViewProduct.stock ?? 10) > 0 ? (
                      <>
                        <FaCheck className="text-green-500" />
                        <span className="text-green-600 font-medium">
                          In Stock ({quickViewProduct.stock ?? 10} available)
                        </span>
                      </>
                    ) : (
                      <span className="text-red-500 font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                    {quickViewProduct.description ||
                      "Premium quality product with excellent craftsmanship."}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => handleAddToCart(quickViewProduct)}
                      disabled={
                        addingToCart === quickViewProduct._id ||
                        (quickViewProduct.stock ?? 10) <= 0
                      }
                      className="flex-1 py-4 bg-[var(--root-color)] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <FaShoppingCart />
                      {addingToCart === quickViewProduct._id
                        ? "Adding..."
                        : "Add to Cart"}
                    </button>
                    <button
                      onClick={() => toggleWishlist(quickViewProduct._id)}
                      className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                        wishlist.includes(quickViewProduct._id)
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-500"
                      }`}
                    >
                      <FaHeart />
                    </button>
                    <button
                      onClick={() => {
                        setQuickViewProduct(null);
                        navigate(`/product/${quickViewProduct._id}`);
                      }}
                      className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-[var(--root-color)] hover:text-white transition-colors"
                    >
                      <FaExpand />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Section - Split Design */}
      <div className="relative bg-white dark:bg-gray-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left - Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-[var(--root-color)] to-purple-700 p-8 md:p-12 lg:p-16 flex items-center"
          >
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative z-10 w-full">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.9, rotate: -3 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute -inset-4 bg-white/20 rounded-3xl blur-xl" />
                  <img
                    src={aboutData.heroImage}
                    alt="Store"
                    className="relative w-full h-[300px] md:h-[400px] object-cover rounded-3xl shadow-2xl"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-6 -right-4 md:right-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 md:p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-black text-2xl">
                        {aboutData.yearsOfExperience}+
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">
                        Years
                      </p>
                      <p className="text-gray-500 text-sm">of Excellence</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -top-4 -left-4 md:left-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4"
                >
                  <div className="text-center">
                    <p className="text-3xl font-black bg-gradient-to-r from-[var(--root-color)] to-purple-600 bg-clip-text text-transparent">
                      {aboutData.happyCustomers >= 1000
                        ? `${Math.floor(aboutData.happyCustomers / 1000)}K+`
                        : `${aboutData.happyCustomers}+`}
                    </p>
                    <p className="text-gray-500 text-xs font-medium">
                      Happy Customers
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="flex gap-4 mt-8 justify-center">
                {aboutData.heroSmallImage1 && (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    src={aboutData.heroSmallImage1}
                    alt="Detail"
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-2xl shadow-xl ring-4 ring-white/30 hover:ring-white/60 transition-all hover:scale-105"
                  />
                )}
                {aboutData.heroSmallImage2 && (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    src={aboutData.heroSmallImage2}
                    alt="Detail"
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-2xl shadow-xl ring-4 ring-white/30 hover:ring-white/60 transition-all hover:scale-105"
                  />
                )}
              </div>
            </div>
          </motion.div>

          {/* Right - Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex items-center p-8 md:p-12 lg:p-16 bg-gray-50 dark:bg-gray-800"
          >
            <div className="max-w-xl">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-block px-4 py-2 bg-[var(--root-color)]/10 text-[var(--root-color)] rounded-full text-sm font-bold mb-6"
              >
                ✨ WHO WE ARE
              </motion.span>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                {aboutData.heroTitle || "Crafting Quality Since Day One"}
              </h2>

              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
                {aboutData.heroDescription ||
                  "We bring you the finest products with unmatched quality and service."}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <feature.icon className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {feature.title}
                      </p>
                      <p className="text-xs text-gray-500">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/products")}
                  className="group px-8 py-4 bg-[var(--root-color)] text-white rounded-xl font-bold shadow-lg shadow-[var(--root-color)]/30 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  <FaShoppingBag />
                  Shop Now
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="px-8 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-2 border-gray-200 dark:border-gray-600"
                >
                  Learn More
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Best Products Section */}
      {aboutData.bestProducts && aboutData.bestProducts.length > 0 && (
        <div className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="container px-4 md:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-600 dark:text-red-400 rounded-full text-sm font-bold mb-4">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                TRENDING NOW
              </span>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
                {aboutData.bestProductsTitle || "Best Sellers"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                {aboutData.bestProductsDescription ||
                  "Our most loved products by customers"}
              </p>
            </motion.div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {aboutData.bestProducts.slice(0, 8).map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => {
                    setHoveredProduct(null);
                    setHoveredImageIndex((prev) => ({
                      ...prev,
                      [product._id]: 0,
                    }));
                  }}
                  className="group relative"
                >
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700">
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={
                          product.images?.[
                            hoveredImageIndex[product._id] || 0
                          ] || "/placeholder.png"
                        }
                        alt={product.name}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          hoveredProduct === product._id
                            ? "scale-110"
                            : "scale-100"
                        }`}
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.discount && product.discount > 0 && (
                          <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                            -{product.discount}%
                          </span>
                        )}
                        {isNewProduct(product.createdAt) && (
                          <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                            NEW
                          </span>
                        )}
                        {(product.stock ?? 10) <= 0 && (
                          <span className="px-2.5 py-1 bg-gray-800 text-white text-xs font-bold rounded-full shadow-lg">
                            SOLD OUT
                          </span>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product._id);
                          }}
                          className={`w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition-all ${
                            wishlist.includes(product._id)
                              ? "bg-red-500 text-white"
                              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white"
                          }`}
                        >
                          {wishlist.includes(product._id) ? (
                            <FaHeart className="text-sm" />
                          ) : (
                            <FaRegHeart className="text-sm" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProduct(product);
                            setQuickViewImageIndex(0);
                          }}
                          className="w-9 h-9 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-[var(--root-color)] hover:text-white transition-colors"
                        >
                          <FaEye className="text-sm" />
                        </button>
                      </div>

                      {/* Image Gallery Dots */}
                      {product.images && product.images.length > 1 && (
                        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {product.images.slice(0, 4).map((_, imgIdx) => (
                            <button
                              key={imgIdx}
                              onMouseEnter={() =>
                                handleImageHover(product._id, imgIdx)
                              }
                              className={`w-2 h-2 rounded-full transition-all ${
                                (hoveredImageIndex[product._id] || 0) === imgIdx
                                  ? "bg-white w-4"
                                  : "bg-white/50 hover:bg-white/80"
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={
                          addingToCart === product._id ||
                          (product.stock ?? 10) <= 0
                        }
                        className="absolute bottom-4 left-4 right-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl font-bold text-sm shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 hover:bg-[var(--root-color)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaShoppingCart className="text-xs" />
                        {addingToCart === product._id
                          ? "Adding..."
                          : (product.stock ?? 10) <= 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>
                    </div>

                    {/* Product Info */}
                    <div
                      className="p-4"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-[var(--root-color)] uppercase tracking-wider">
                          {product.category}
                        </p>
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-400 text-xs" />
                          <span className="text-xs text-gray-500">
                            {product.rating?.toFixed(1) || "4.5"}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base line-clamp-1 mb-2 group-hover:text-[var(--root-color)] transition-colors cursor-pointer">
                        {product.name}
                      </h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg md:text-xl font-black text-gray-900 dark:text-white">
                          Rs.{" "}
                          {getDiscountedPrice(
                            product.price,
                            product.discount
                          ).toLocaleString()}
                        </span>
                        {product.discount && product.discount > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            Rs. {product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {/* Stock indicator */}
                      {(product.stock ?? 10) > 0 &&
                        (product.stock ?? 10) <= 5 && (
                          <p className="text-xs text-orange-500 mt-1 font-medium">
                            Only {product.stock} left!
                          </p>
                        )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* View All Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <ViewAllButton
                to="/products"
                label="Explore All Products"
                variant="primary"
                size="large"
                rounded
              />
            </motion.div>
          </div>
        </div>
      )}

      {/* Brand Logos Infinite Carousel */}
      {brands.length > 0 && (
        <div className="py-12 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 overflow-hidden">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center text-gray-500 text-sm font-medium mb-8"
          >
            TRUSTED BY LEADING BRANDS
          </motion.p>

          {/* Infinite Scroll Container */}
          <div className="relative">
            <div className="flex animate-scroll">
              {/* First set of brands */}
              {[...brands, ...brands, ...brands].map((brand, idx) => (
                <div
                  key={`brand-${idx}`}
                  className="flex-shrink-0 mx-8 md:mx-12 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer"
                  onClick={() =>
                    brand.website && window.open(brand.website, "_blank")
                  }
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-10 md:h-14 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>

          <style>{`
            @keyframes scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-33.333%);
              }
            }
            .animate-scroll {
              animation: scroll 20s linear infinite;
              width: fit-content;
            }
            .animate-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>
        </div>
      )}
    </section>
  );
};

export default StoreHighlights;
