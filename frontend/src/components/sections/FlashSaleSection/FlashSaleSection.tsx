import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaFire, FaClock, FaBolt } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { api } from "../../../services/api";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../../../context/ToastContext";
import FlashProductCard from "../../products/FlashProductCard";
import ViewAllButton from "../../common/ViewAllButton";
import Loading from "../../common/Loading";

interface FlashProduct {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  image?: string;
  stock?: number;
  discount?: number;
  flashPrice?: number;
  flashDiscountType?: string;
  flashDiscountValue?: number;
  flashEndTime?: string;
  flashStock?: number;
  colorVariants?: Array<{
    colorName: string;
    colorCode: string;
    images?: string[];
    sku?: string;
    price?: number;
    stock?: number;
    isActive: boolean;
    isFlashSale?: boolean;
    flashDiscountType?: string;
    flashDiscountValue?: number;
    flashStartTime?: string;
    flashEndTime?: string;
    flashStock?: number;
  }>;
}

const FlashSaleSection = () => {
  const [products, setProducts] = useState<FlashProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { addToCart } = useCart();
  const { success, error } = useToast();

  useEffect(() => {
    fetchFlashSales();
  }, []);

  useEffect(() => {
    if (products.length > 0 && products[0].flashEndTime) {
      const timer = setInterval(() => {
        updateCountdown(products[0].flashEndTime!);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [products]);

  const fetchFlashSales = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/flash-sales/home?limit=8");
      setProducts(data);
    } catch (err) {
      // Set empty array on error so section still shows
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      fetchFlashSales(); // Refresh to get new flash sales
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeLeft({ hours, minutes, seconds });
  };

  const handleAddToCart = async (product: FlashProduct) => {
    try {
      await addToCart(product._id, 1);
      success(`🔥 ${product.title} added to cart!`);
    } catch (err: any) {
      error(err.message || "Failed to add to cart");
    }
  };

  const calculateDiscount = (product: FlashProduct) => {
    if (product.flashDiscountType === "percentage") {
      return `${product.flashDiscountValue}%`;
    }
    return `Rs. ${product.flashDiscountValue}`;
  };

  if (loading) return <Loading />;

  // Always show the section, even if no products
  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-red-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header with Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaBolt className="w-8 h-8 text-yellow-500 animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Flash Sale
            </h2>
            <FaFire className="w-8 h-8 text-orange-500 animate-pulse" />
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
            Limited time offers - Grab them before they're gone!
          </p>

          {products.length > 0 && (
            <div className="flex items-center justify-center gap-4 mb-4">
              <FaClock className="w-6 h-6 text-orange-600" />
              <div className="flex gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-lg min-w-[70px]">
                  <div className="text-3xl font-bold text-orange-600">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 uppercase">Hours</div>
                </div>
                <div className="text-3xl font-bold text-orange-600 self-center">:</div>
                <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-lg min-w-[70px]">
                  <div className="text-3xl font-bold text-orange-600">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 uppercase">Minutes</div>
                </div>
                <div className="text-3xl font-bold text-orange-600 self-center">:</div>
                <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-lg min-w-[70px]">
                  <div className="text-3xl font-bold text-orange-600">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 uppercase">Seconds</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-xl max-w-2xl mx-auto">
              <FaFire className="w-20 h-20 text-orange-400 mx-auto mb-6 animate-pulse" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Flash Sales Right Now
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Check back soon for amazing deals! Flash sales are coming soon.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold">
                <FaClock className="w-5 h-5" />
                Stay Tuned!
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              prevEl: ".flash-sale-prev",
              nextEl: ".flash-sale-next",
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={products.length > 4}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 32,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 40,
              },
            }}
            className="!pb-12"
          >
            {products.map((product, index) => {
              const colorSchemes: Array<"blue" | "purple" | "orange"> = ["blue", "purple", "orange"];
              const colorScheme = colorSchemes[index % 3];
              
              return (
              <SwiperSlide key={product._id}>
                <FlashProductCard
                  product={{
                    ...product,
                    price: product.flashPrice || product.price,
                    originalPrice: product.price,
                  }}
                  onAddToCart={handleAddToCart}
                  colorScheme={colorScheme}
                />
              </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button className="flash-sale-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-orange-500 hover:text-white transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="flash-sale-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-orange-500 hover:text-white transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <ViewAllButton to="/flash-sales" text="View All Flash Deals" />
        </motion.div>
      </div>

      <style>{`
        .swiper-pagination-bullet {
          background: #f97316;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          background: #f97316;
        }
        @keyframes delay-1000 {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};

export default FlashSaleSection;
