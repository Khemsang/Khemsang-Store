import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTrophy, FaFire } from "react-icons/fa";
import { api } from "../../../services/api";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../../../context/ToastContext";
import SimpleProductCard from "../../products/SimpleProductCard";
import ViewAllButton from "../../common/ViewAllButton";
import Loading from "../../common/Loading";

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  image?: string;
  stock?: number;
  discount?: number;
  totalOrders?: number;
}

const TopSellingProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { success, error } = useToast();

  useEffect(() => {
    fetchTopSellingProducts();
  }, []);

  const fetchTopSellingProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/products/top-selling");
      setProducts(data.slice(0, 12)); // Show top 12 products
    } catch (err) {
      console.error("Error fetching top selling products:", err);
      // Fallback to regular products if endpoint doesn't exist
      try {
        const { data } = await api.get("/products?limit=12");
        setProducts(data.products || data);
      } catch (fallbackErr) {
        console.error("Error fetching fallback products:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product._id, 1);
      success(`${product.title} added to cart!`);
    } catch (err: any) {
      error(err.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Attractive Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Top Selling
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></div>
            </div>
            <button 
              onClick={() => navigate("/best-sellers")}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              View All →
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Most popular products loved by our customers
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <SimpleProductCard
              key={product._id}
              product={product}
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

export default TopSellingProducts;
