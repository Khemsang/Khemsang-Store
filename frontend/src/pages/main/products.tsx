import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useProducts } from "../../hooks/useProducts";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import Pagination from "../../components/common/Pagination";
import ProductFilters from "../../components/products/ProductFilters";
import ProductCard from "../../components/products/ProductCard";
import QuickView from "../../components/ui/QuickView";
import ProductComparison from "../../components/ui/ProductComparison";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import { ProductGridSkeleton } from "../../components/ui/SkeletonLoader";
import { Loading } from "../../components/ui/loading";
import { FaBalanceScale } from "react-icons/fa";

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  

  useScrollToTop(currentPage);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [compareProducts, setCompareProducts] = useState<any[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const itemsPerPage = 16;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { data: allProducts = [], isLoading: loading } = useProducts(false);
  

  const allCategories = useMemo(() => {
    const categories = allProducts.map((p) => p.category);
    return [...new Set(categories)];
  }, [allProducts]);

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


  const products = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesSearch = !searchTerm || 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = p.price >= priceRange.min && p.price <= priceRange.max;
      
      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [allProducts, selectedCategory, searchTerm, priceRange]);


  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) setSelectedCategory(categoryFromUrl);
  }, [searchParams]);


  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [products, currentPage]);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handleAddToCart = async (productId: string) => {

    if (addingToCart === productId) {
      return;
    }

    if (!user) {
      navigate("/login", { state: { from: "/products" } });
      return;
    }
    
    try {
      setAddingToCart(productId);
      

      const isExistingItem = cart.some((item) => {
        return item.product?._id === productId && !item.colorVariant;
      });
      
      await addToCart(productId, 1);
      

      if (!isExistingItem) {
        success("Added to cart!");
      }
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 md:py-20">
      <div className="container px-4 md:px-6 lg:px-8">
        
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Our <span className="bg-blue-600 bg-clip-text text-transparent">Products</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover our collection of premium products crafted with care
          </p>
        </div>

        
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

        
        {compareProducts.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <button
              onClick={() => setShowCompare(true)}
              className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all"
            >
              <FaBalanceScale className="w-5 h-5" />
              <span className="font-semibold">
                Compare ({compareProducts.length})
              </span>
            </button>
          </div>
        )}

        
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
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

      
      <QuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      
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
