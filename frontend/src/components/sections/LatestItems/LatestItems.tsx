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
import Loading from "../../common/Loading";

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

  const handleAddToCart = async (product: any) => {
    const result = await addToCart(product._id, 1);
    if (result?.isNew) {
      showToast(`${product.title} added to cart!`, "success");
    }
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
    return <Loading text="Loading latest items..." size="sm" variant="minimal" />;
  }

  return (
    <section className="py-10 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800" ref={ref}>
      <div className="container mx-auto max-w-7xl">
        {/* Attractive Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Just For You
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></div>
            </div>
            <button 
              onClick={() => navigate("/products")}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              View All →
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Discover our newest arrivals and trending products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {latestProducts.map((item) => (
            <SimpleProductCard
              key={item._id}
              product={item}
              onAddToCart={handleAddToCart}
              showOriginalPrice={true}
              showColorVariants={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestItems;
