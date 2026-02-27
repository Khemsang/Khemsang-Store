import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTag, FaClock, FaPercent, FaFire } from "react-icons/fa";
import { api } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import SimpleProductCard from "../../components/products/SimpleProductCard";

// eslint-disable-next-line @typescript-eslint/no-unused-vars

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  stock: number;
}

interface Coupon {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  expiresAt: string;
  minOrderAmount?: number;
}

const Deals = () => {
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { showToast } = useToast();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const [productsRes, couponsRes] = await Promise.all([
        api.get("/products"),
        api.get("/coupons").catch(() => ({ data: [] })),
      ]);

      // Filter products with discounts
      const discounted = productsRes.data.filter(
        (p: Product) => p.originalPrice && p.originalPrice > p.price
      );
      setDiscountedProducts(discounted);

      // Filter active coupons
      const activeCoupons = couponsRes.data.filter(
        (c: Coupon) => new Date(c.expiresAt) > new Date()
      );
      setCoupons(activeCoupons);
    } catch (error) {
      console.error("Failed to fetch deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDiscount = (product: Product) => {
    if (!product.originalPrice) return 0;
    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Coupon code "${code}" copied!`, "success");
  };

  const handleAddToCart = async (product: any) => {
    // Prevent rapid clicks
    if (addingToCart === product._id) {
      return;
    }

    try {
      setAddingToCart(product._id);
      
      // Check if product already exists in cart BEFORE API call
      const isExistingItem = cart.some((item) => {
        return item.product?._id === product._id && !item.colorVariant;
      });
      
      await addToCart(product._id, 1);
      
      // Only show toast if it was a NEW item
      if (!isExistingItem) {
        showToast(`${product.title} added to cart!`, "success");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Failed to add to cart", "error");
    } finally {
      setAddingToCart(null);
    }
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
            <FaFire className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Hot Deals & Offers
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Don't miss out on our amazing discounts and special offers
          </p>
        </div>

        {/* Active Coupons */}
        {coupons.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FaTag className="text-purple-600" />
              Active Coupon Codes
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <FaPercent className="w-5 h-5" />
                      <span className="text-2xl font-bold">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% OFF`
                          : `Rs. ${coupon.discountValue} OFF`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => copyCode(coupon.code)}
                        className="bg-white/20 px-4 py-2 rounded-lg font-mono font-bold cursor-pointer hover:bg-white/30 transition-colors"
                      >
                        {coupon.code}
                      </div>
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className="text-sm underline hover:no-underline"
                      >
                        Copy
                      </button>
                    </div>
                    {coupon.minOrderAmount && (
                      <p className="text-sm text-white/80 mt-3">
                        Min. order: Rs. {coupon.minOrderAmount}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-sm text-white/80 mt-2">
                      <FaClock className="w-3 h-3" />
                      <span>
                        Expires:{" "}
                        {new Date(coupon.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discounted Products */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FaTag className="text-red-500" />
            Discounted Products
          </h2>

          {discountedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
              <FaTag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Deals Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Check back later for amazing deals
              </p>
              <button
                onClick={() => navigate("/products")}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold"
              >
                Browse All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {discountedProducts.map((product) => (
                <SimpleProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  showOriginalPrice={true}
                  showColorVariants={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deals;
