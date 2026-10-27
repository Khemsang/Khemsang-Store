import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import { analytics } from "../../services/analytics";

interface ColorVariant {
  _id: string;
  colorName: string;
  colorCode: string;
  images: string[];
  stock: number;
  price?: number;
  sku?: string;
  isActive: boolean;
}

interface FeaturedProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  productId?: string;
}

interface RegularProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  colorVariants?: ColorVariant[];
}

const FeaturedProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [product, setProduct] = useState<FeaturedProduct | null>(null);
  const [regularProduct, setRegularProduct] = useState<RegularProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ColorVariant | null>(null);
  const [productExists, setProductExists] = useState(true);

  useEffect(() => {
    fetchFeaturedProduct();
  }, [id]);

  const fetchFeaturedProduct = async () => {
    try {
      const { data } = await api.get(`/featured-products/${id}`);
      setProduct(data);
      

      analytics.trackProductView({
        productId: data._id,
        productName: data.title,
        productCategory: data.category,
        productPrice: data.price,
        isFeatured: true
      });
      

      if (data.productId) {
        try {
          const { data: regularData } = await api.get(`/products/${data.productId}`);
          setRegularProduct(regularData);
          setProductExists(true);
          

          if (regularData.colorVariants && regularData.colorVariants.length > 0) {
            const firstActive = regularData.colorVariants.find((v: ColorVariant) => v.isActive);
            if (firstActive) {
              setSelectedVariant(firstActive);
            }
          }
        } catch (err: any) {
          console.error("Failed to fetch linked product:", err);
          setProductExists(false);
          error("The linked product is no longer available");
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch featured product:", err);
      const errorMessage = err.response?.status === 404 
        ? "Featured product not found" 
        : err.response?.data?.message || "Failed to fetch product";
      error(errorMessage);

      setTimeout(() => navigate("/"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleVariantChange = (variant: ColorVariant) => {
    setSelectedVariant(variant);
    setQuantity(0);
  };

  const handleAddToCart = async () => {
    
    if (!user) {
      sessionStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product?.productId || product?._id,
        quantity: quantity,
        returnTo: `/featured/${id}`
      }));
      navigate("/login", { state: { from: `/featured/${id}` } });
      return;
    }
    
    if (addingToCart) {
      return;
    }
    

    try {
      setAddingToCart(true);
      

      const targetProductId = product?.productId || product?._id;
      
      if (!targetProductId) {
        error("Product ID not found");
        return;
      }
      

      if (product?.productId && !productExists) {
        error("Product no longer available");
        return;
      }
      

      const variantInfo = selectedVariant ? {
        colorName: selectedVariant.colorName,
        colorCode: selectedVariant.colorCode
      } : undefined;
      

      const isExistingItem = cart.some((item) => {
        if (!item.product) {
          return false;
        }
        const sameProduct = item.product._id === targetProductId;
        const sameVariant = variantInfo 
          ? (item.colorVariant?.colorName === variantInfo.colorName)
          : !item.colorVariant;
        return sameProduct && sameVariant;
      });
      

      await addToCart(targetProductId, quantity, variantInfo);
      

      analytics.trackAddToCart({
        productId: targetProductId,
        productName: product.title,
        quantity: quantity,
        price: selectedVariant?.price || product.price,
        variant: selectedVariant?.colorName,
        source: 'featured_showcase',
        isNewItem: !isExistingItem,
        isFeatured: true,
        toastShown: !isExistingItem
      });
      

      if (!isExistingItem) {
        success("Added to cart!");
      } else {
      }
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add to cart");
      

      analytics.trackError({
        action: 'add_to_cart',
        errorMessage: err.response?.data?.message || "Failed to add to cart",
        productId: product?.productId,
        source: 'featured_showcase'
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    
    if (!user) {
      sessionStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product?.productId || product?._id,
        quantity: quantity,
        returnTo: '/checkout'
      }));
      navigate("/login", { state: { from: '/checkout' } });
      return;
    }
    
    if (addingToCart) {
      return;
    }
    

    try {
      setAddingToCart(true);
      

      const targetProductId = product?.productId || product?._id;
      
      if (!targetProductId) {
        error("Product ID not found");
        return;
      }
      

      if (product?.productId && !productExists) {
        error("Product no longer available");
        return;
      }
      

      const variantInfo = selectedVariant ? {
        colorName: selectedVariant.colorName,
        colorCode: selectedVariant.colorCode
      } : undefined;
      
      

      const isExistingItem = cart.some((item) => {
        if (!item.product) {
          return false;
        }
        const sameProduct = item.product._id === targetProductId;
        const sameVariant = variantInfo 
          ? (item.colorVariant?.colorName === variantInfo.colorName)
          : !item.colorVariant;
        return sameProduct && sameVariant;
      });
      
      

      await addToCart(targetProductId, quantity, variantInfo);
      

      analytics.trackAddToCart({
        productId: targetProductId,
        productName: product.title,
        quantity: quantity,
        price: selectedVariant?.price || product.price,
        variant: selectedVariant?.colorName,
        source: 'featured_showcase',
        isNewItem: !isExistingItem,
        isFeatured: true,
        toastShown: !isExistingItem
      });
      

      if (!isExistingItem) {
        success("Product added to cart!");
      } else {
      }
      
      navigate("/checkout");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add to cart");
      

      analytics.trackError({
        action: 'buy_now',
        errorMessage: err.response?.data?.message || "Failed to add to cart",
        productId: product?.productId,
        source: 'featured_showcase'
      });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Product Not Found
          </h2>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900 py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        
        <nav className="flex items-center gap-2 text-sm mb-6 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Home
          </button>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-gray-900 dark:text-white font-medium truncate">
            {product.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="relative">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 dark:from-gray-700 dark:to-gray-800">
                  {imageError ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-24 h-24 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                  ) : (
                    <img
                      src={product.image || "/placeholder.jpg"}
                      alt={product.title}
                      className="w-full h-full object-contain p-8"
                      onError={() => setImageError(true)}
                    />
                  )}
                  {product.discount && product.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
                      -{product.discount}% OFF
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {product.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {product.title}
              </h1>

              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-6">
                {product.description}
              </p>

              
              {regularProduct?.colorVariants && regularProduct.colorVariants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Available Colors ({regularProduct.colorVariants.length})
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {regularProduct.colorVariants.map((variant) => (
                      <button
                        key={variant._id}
                        onClick={() => handleVariantChange(variant)}
                        disabled={!variant.isActive || variant.stock === 0}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedVariant?._id === variant._id
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                        } ${
                          !variant.isActive || variant.stock === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        title={`${variant.colorName} - ${variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: variant.colorCode }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {variant.colorName}
                        </span>
                        {variant.stock === 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            Out
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedVariant && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">
                          Selected: <span className="font-semibold">{selectedVariant.colorName}</span>
                        </span>
                        <span className={`font-semibold ${selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-50 dark:from-blue-900/20 dark:to-orange-900/20 rounded-xl p-6 mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl md:text-5xl font-bold bg-blue-600 bg-clip-text text-transparent">
                    Rs. {(selectedVariant?.price || product.price).toLocaleString()}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > (selectedVariant?.price || product.price) && (
                      <span className="text-xl text-gray-500 line-through">
                        Rs. {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                </div>
                {product.discount && product.discount > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-semibold">
                    You save Rs.{" "}
                    {(
                      (product.originalPrice || 0) - (selectedVariant?.price || product.price)
                    ).toLocaleString()}{" "}
                    ({product.discount}% off)
                  </p>
                )}
              </div>

              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                  Quantity:
                </span>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(0, quantity - 1))}
                    disabled={quantity === 0}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <span className="w-16 text-center font-bold text-xl text-gray-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => {
                      const maxStock = selectedVariant?.stock || regularProduct?.stock || 999;
                      setQuantity(Math.min(maxStock, quantity + 1));
                    }}
                    disabled={quantity >= (selectedVariant?.stock || regularProduct?.stock || 999)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
                {selectedVariant && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Max: {selectedVariant.stock}
                  </span>
                )}
              </div>

              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || quantity === 0 || (selectedVariant ? selectedVariant.stock === 0 : false)}
                  className="flex-1 py-4 px-6 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  {addingToCart ? "Adding..." : quantity === 0 ? "Select Quantity" : selectedVariant && selectedVariant.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart || quantity === 0 || (selectedVariant ? selectedVariant.stock === 0 : false)}
                  className="flex-1 py-4 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {addingToCart ? "Processing..." : quantity === 0 ? "Select Quantity" : selectedVariant && selectedVariant.stock === 0 ? "Out of Stock" : "Buy Now"}
                </button>
              </div>

              
              {product.productId && !productExists && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Product No Longer Available</span>
                  </div>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1 ml-7">
                    The linked product has been removed or is no longer available for purchase.
                  </p>
                </div>
              )}

              
              {(!product.productId || productExists) && (
                <div 
                  className="mt-4 p-3 bg-yellow-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 cursor-help"
                  title="This product is highlighted on the home page for a limited time. It can be purchased just like any other product."
                >
                  <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">Featured Product</span>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 ml-7">
                    This product is highlighted on the home page for a limited time. Shop now for the best deals!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProductDetails;
