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
  const { showToast } = useToast();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);

      // Fetch featured products from admin panel
      const { data } = await api.get("/featured-products");

      // Fetch all real products to match
      let allProducts: any[] = [];
      try {
        const productsResponse = await api.get("/products");
        allProducts = productsResponse.data;
      } catch (err) {
        // Silently handle error
      }

      // Sort by newest first and take only latest 4
      const latestFeatured = data
        .filter((item: any) => item.isActive)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 4)
        .map((featured: any) => {
          // If productId exists, use it
          if (featured.productId) {
            return featured;
          }

          // Try to find matching product by title
          const matchingProduct = allProducts.find(
            (p: any) =>
              p.title.toLowerCase().trim() ===
              featured.title.toLowerCase().trim()
          );

          if (matchingProduct) {
            return { ...featured, productId: matchingProduct._id };
          }

          return featured;
        });

      setProducts(latestFeatured);
    } catch (error) {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading products..." size="sm" variant="minimal" />;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-orange-600/10 rounded-full mb-3">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-blue-600">
              Featured Collection
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
            Featured Products
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-justify">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {products.map((product) => (
              <SimpleProductCard
                key={product._id}
                product={product}
                onAddToCart={() => {
                  if (product.productId) {
                    addToCart(product.productId, 1);
                    showToast(`${product.title} added to cart!`, "success");
                  } else {
                    navigate(`/featured/${product._id}`);
                  }
                }}
                badge={
                  <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold rounded flex items-center gap-1">
                    <FaStar className="w-2.5 h-2.5" />
                    Featured
                  </span>
                }
                linkPrefix="/featured"
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        {products.length > 0 && (
          <ViewAllButton
            to="/featured-products"
            label="View All Featured Products"
            variant="primary"
          />
        )}
      </div>
    </div>
  );
};

export default ProductShowcase;
