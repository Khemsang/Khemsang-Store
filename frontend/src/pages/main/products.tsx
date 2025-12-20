import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useProducts } from "../../hooks/useProducts";
import { Pagination } from "../../components/common";
import ProductFilters from "../../components/products/ProductFilters";
import ProductCard from "../../components/products/ProductCard";
import {
  QuickView,
  ProductComparison,
  Breadcrumbs,
  ProductGridSkeleton,
} from "../../components/ui";
import { FaBalanceScale } from "react-icons/fa";

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [compareProducts, setCompareProducts] = useState<any[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const itemsPerPage = 16;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const {
    products: allProducts,
    allCategories,
    loading,
  } = useProducts(selectedCategory, searchTerm);

  const handleQuickView = (product: any) => {
    setQuickViewProduct(product);
  };

  const handleAddToCompare = (product: any) => {
    if (compareProducts.find((p) => p._id === product._id)) {
      setCompareProducts(compareProducts.filter((p) => p._id !== product._id));
      success("Removed from compare");
    } else if (compareProducts.length >= 4) {
      error("You can compare up to 4 products");
    } else {
      setCompareProducts([...compareProducts, product]);
      success("Added to compare");
    }
  };

  // Filter products by price range
  const products = useMemo(() => {
    return allProducts.filter(
      (p) => p.price >= priceRange.min && p.price <= priceRange.max
    );
  }, [allProducts, priceRange]);

  // Read category from URL on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) setSelectedCategory(categoryFromUrl);
  }, [searchParams]);

  // Paginated products
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [products, currentPage]);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      navigate("/login", { state: { from: "/products" } });
      return;
    }
    try {
      await addToCart(productId, 1);
      success("Added to cart!");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 md:py-20">
      <div className="container px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Our <span className="text-[var(--root-color)]">Products</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover our collection of premium products crafted with care
          </p>
        </div>

        {/* Filters */}
        <ProductFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={allCategories}
          totalProducts={products.length}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          maxPrice={500000}
        />

        {/* Compare Button */}
        {compareProducts.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <button
              onClick={() => setShowCompare(true)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all"
            >
              <FaBalanceScale className="w-5 h-5" />
              <span className="font-semibold">
                Compare ({compareProducts.length})
              </span>
            </button>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={16} />
        ) : currentItems.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {currentItems.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onQuickView={handleQuickView}
                  onCompare={handleAddToCompare}
                  isComparing={compareProducts.some(
                    (p) => p._id === product._id
                  )}
                />
              ))}
            </div>

            {/* Pagination */}
            {products.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={products.length}
              />
            )}
          </>
        )}
      </div>

      {/* Quick View Modal */}
      <QuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Product Comparison Modal */}
      <ProductComparison
        products={compareProducts}
        isOpen={showCompare}
        onClose={() => setShowCompare(false)}
        onRemove={(id) =>
          setCompareProducts(compareProducts.filter((p) => p._id !== id))
        }
      />
    </section>
  );
};

export default Products;
