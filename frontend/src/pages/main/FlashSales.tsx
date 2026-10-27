import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFire, FaClock, FaBolt, FaArrowLeft } from "react-icons/fa";
import { api } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import FlashProductCard from "../../components/products/FlashProductCard";
import { Loading } from "../../components/ui/loading";
import { motion } from "framer-motion";

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
  description?: string;
  rating?: number;
  numReviews?: number;
}

const FlashSales = () => {
  const [products, setProducts] = useState<FlashProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

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
      const { data } = await api.get("/flash-sales");
      setProducts(data);
    } catch (err) {
      console.error("Error fetching flash sales:", err);
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
      fetchFlashSales();
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeLeft({ hours, minutes, seconds });
  };

  const handleAddToCart = async (product: FlashProduct) => {
    try {
      const result = await addToCart(product._id, 1);
      if (result.isNew) {
        showToast(`🔥 ${product.title} added to cart!`, "success");
      } else {
        showToast("Quantity updated in cart", "info");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to add to cart", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-20 w-64 h-64 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-200/30 dark:bg-red-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span className="font-semibold">Back to Home</span>
        </motion.button>

        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaBolt className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Flash Sale
            </h1>
            <FaFire className="w-8 h-8 text-orange-500" />
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-base mb-6">
            Limited time offers - Grab them before they're gone!
          </p>

          
          {products.length > 0 && products[0].flashEndTime && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <FaClock className="w-6 h-6 text-orange-600" />
              <div className="flex gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-lg min-w-[70px]">
                  <div className="text-3xl font-bold text-orange-600">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Hours</div>
                </div>
                <div className="text-3xl font-bold text-orange-600 self-center">:</div>
                <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-lg min-w-[70px]">
                  <div className="text-3xl font-bold text-orange-600">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Minutes</div>
                </div>
                <div className="text-3xl font-bold text-orange-600 self-center">:</div>
                <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-lg min-w-[70px]">
                  <div className="text-3xl font-bold text-orange-600">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Seconds</div>
                </div>
              </div>
            </motion.div>
          )}

          
          {products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg font-semibold"
            >
              <FaFire className="w-4 h-4" />
              <span>{products.length} Hot Deals Available</span>
            </motion.div>
          )}
        </motion.div>

        
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg max-w-2xl mx-auto">
              <FaFire className="w-24 h-24 text-orange-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                No Flash Sales Right Now
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Check back soon for amazing deals!
              </p>
              <button 
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <FaClock className="w-5 h-5" />
                Browse Products
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-6 flex items-center justify-between flex-wrap gap-4"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <FaBolt className="w-4 h-4 text-orange-500" />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {products.length} Flash Deals
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Limited Stock Available
              </div>
            </motion.div>

            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {products.map((product, index) => {
                const colorSchemes: Array<"blue" | "purple" | "orange"> = ["orange", "purple", "blue"];
                const colorScheme = colorSchemes[index % 3];
                
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.05 * (index % 8)
                    }}
                  >
                    <FlashProductCard
                      product={{
                        ...product,
                        price: product.flashPrice || product.price,
                        originalPrice: product.price,
                      }}
                      onAddToCart={handleAddToCart}
                      colorScheme={colorScheme}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </div>

      <style>{`
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};

export default FlashSales;
