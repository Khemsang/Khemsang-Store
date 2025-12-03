import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/api";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  productId?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ProductShowcase = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    return (
      <div className="bg-white py-12 px-4 md:px-8">
        <div className="container mx-auto text-center text-gray-500">
          Loading products...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--root-color)]/10 to-purple-600/10 rounded-full mb-3">
            <svg
              className="w-5 h-5 text-[var(--root-color)]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-[var(--root-color)]">
              Featured Collection
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[var(--root-color)] to-purple-600 bg-clip-text text-transparent">
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => {
                  navigate(`/featured/${product._id}`);
                }}
                className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-[var(--root-color)]"
              >
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <img
                    src={
                      product.images?.[0] || product.image || "/placeholder.jpg"
                    }
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </div>
                  {product.discount && product.discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                      -{product.discount}%
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-3 sm:p-4">
                  <span className="inline-block px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-semibold mb-2">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 text-justify">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-base sm:text-lg font-bold text-[var(--root-color)]">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
                          <span className="text-xs text-gray-500 line-through">
                            Rs. {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                    </div>
                    <button className="bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white px-3 py-1.5 rounded-lg hover:from-[var(--root-color)] hover:to-purple-700 transition-all text-xs font-medium shadow-md">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {products.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => navigate("/featured-products")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white px-6 py-3 rounded-xl hover:from-[var(--root-color)] hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>View All Featured Products</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductShowcase;
