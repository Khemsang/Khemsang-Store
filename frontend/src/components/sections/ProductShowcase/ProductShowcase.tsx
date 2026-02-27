import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { api } from "../../../services/api";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../../../context/ToastContext";
import SimpleProductCard from "../../products/SimpleProductCard";
import ViewAllButton from "../../common/ViewAllButton";
import Loading from "../../common/Loading";

const ProductShowcase = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { success: showToast } = useToast();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);

      // Fetch featured products from admin panel
      const { data: featuredData } = await api.get("/featured-products");

      // Fetch all real products
      const { data: allProducts } = await api.get("/products");

      // Map featured products to real products
      const mappedProducts = featuredData
        .filter((item: any) => item.isActive && item.productId)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 4)
        .map((featured: any) => {
          // Find the real product
          const realProduct = allProducts.find((p: any) => p._id === featured.productId);
          
          if (realProduct) {
            // Return real product with featured badge info
            return {
              ...realProduct,
              isFeatured: true,
              featuredId: featured._id,
            };
          }
          
          return null;
        })
        .filter((p: any) => p !== null);

      setProducts(mappedProducts);
    } catch (error) {
      console.error("Error fetching featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: any) => {
    try {
      // Add to cart directly with quantity 1
      await addToCart(product._id, 1);
      showToast("Added to cart!");
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      showToast(error.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return <Loading text="Loading products..." size="sm" variant="minimal" />;
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 py-10 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Attractive Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Featured Products
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></div>
            </div>
            {products.length > 0 && (
              <button 
                onClick={() => navigate("/featured-products")}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                View All →
              </button>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Handpicked premium products just for you
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No featured products available
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {products.map((product) => (
              <SimpleProductCard
                key={product._id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                showOriginalPrice={true}
                showColorVariants={true}
                badge={
                  <div className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded text-xs font-bold flex items-center gap-1">
                    <FaStar className="w-2.5 h-2.5" />
                    Featured
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductShowcase;
