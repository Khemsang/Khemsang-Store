import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchProducts } from "../../../store/slices/productsSlice";
import SimpleProductCard from "../../products/SimpleProductCard";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../../../context/ToastContext";
import ViewAllButton from "../../common/ViewAllButton";

const LatestItems: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: products, loading } = useAppSelector(
    (state) => state.products
  );
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (product: any) => {
    addToCart(product._id, 1);
    showToast(`${product.title} added to cart!`, "success");
  };

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

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {latestProducts.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 30 }}
                animate={controls}
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.05, duration: 0.5 },
                  },
                }}
              >
                <SimpleProductCard
                  product={item}
                  onAddToCart={handleAddToCart}
                  badge={
                    <span className="px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-bold rounded">
                      NEW
                    </span>
                  }
                />
              </motion.div>
            ))}
          </div>

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
          >
            <ViewAllButton
              to="/products"
              label="View All Products"
              variant="green"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default LatestItems;
