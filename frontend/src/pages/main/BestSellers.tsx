import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrophy, FaStar, FaFire } from "react-icons/fa";
import { api } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import SimpleProductCard from "../../components/products/SimpleProductCard";

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  stock: number;
  rating?: number;
  numReviews?: number;
  soldCount?: number;
}

const BestSellers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    fetchBestSellers();
  }, []);

  const fetchBestSellers = async () => {
    try {
      const { data } = await api.get("/products");
      // Sort by rating/reviews (simulating best sellers)
      const sorted = data
        .sort(
          (a: Product, b: Product) =>
            (b.rating || 0) * (b.numReviews || 1) -
            (a.rating || 0) * (a.numReviews || 1)
        )
        .slice(0, 20);
      setProducts(sorted);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart(product._id, 1);
    showToast(`${product.title} added to cart!`, "success");
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { bg: "bg-yellow-500", text: "🥇 #1" };
    if (index === 1) return { bg: "bg-gray-400", text: "🥈 #2" };
    if (index === 2) return { bg: "bg-amber-600", text: "🥉 #3" };
    return { bg: "bg-purple-600", text: `#${index + 1}` };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <FaTrophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Best Sellers
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our most popular products loved by customers
          </p>
        </div>

        {/* Top 3 Featured */}
        {products.length >= 3 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {products.slice(0, 3).map((product, index) => (
              <div
                key={product._id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer group ${
                  index === 0 ? "md:scale-105 ring-4 ring-yellow-400" : ""
                }`}
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className={`${
                      getRankBadge(index).bg
                    } text-white px-3 py-1 rounded-full text-sm font-bold`}
                  >
                    {getRankBadge(index).text}
                  </span>
                </div>
                {index === 0 && (
                  <div className="absolute top-4 right-4 z-10">
                    <FaFire className="w-6 h-6 text-orange-500 animate-pulse" />
                  </div>
                )}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <FaStar className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {product.rating?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {product.numReviews || 0} reviews
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-purple-600">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={product.stock === 0}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rest of Products */}
        {products.length > 3 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {products.slice(3).map((product, index) => (
              <SimpleProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                badge={
                  <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded">
                    #{index + 4}
                  </span>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BestSellers;
