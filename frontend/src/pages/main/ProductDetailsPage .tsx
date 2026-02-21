import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import { FaHeart } from "react-icons/fa";
import ProductReviews from "../../components/sections/ProductReviews/ProductReviews";
import RecentlyViewed, { addToRecentlyViewed } from "../../components/sections/RecentlyViewed/RecentlyViewed";
import ShareProduct from "../../components/ui/ShareProduct";
import SizeGuide from "../../components/ui/SizeGuide";
import EstimatedDelivery from "../../components/ui/EstimatedDelivery";
import NotifyMe from "../../components/ui/NotifyMe";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import { 
  Package, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RefreshCw,
  Star,
  Minus,
  Plus,
  ZoomIn,
  Home,
  ChevronRight,
  Info
} from "lucide-react";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  createdBy: {
    name: string;
    email: string;
  };
}

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [reviewStats, setReviewStats] = useState<{
    averageRating: number;
    totalReviews: number;
  } | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviewStats();
    checkWishlist();
    if (id) {
      addToRecentlyViewed(id);
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const { data } = await api.get(`/reviews/product/${id}/stats`);
      setReviewStats(data);
    } catch (err: any) {
      console.error("Failed to fetch review stats:", err);
    }
  };

  const checkWishlist = async () => {
    if (!id) return;
    if (user) {
      try {
        const { data } = await api.get("/auth/wishlist");
        const ids = data.map((p: any) => p._id);
        setIsInWishlist(ids.includes(id));
      } catch {
        setIsInWishlist(false);
      }
    } else {
      const saved = localStorage.getItem("wishlist");
      const ids = saved ? JSON.parse(saved) : [];
      setIsInWishlist(ids.includes(id));
    }
  };

  const toggleWishlist = async () => {
    if (!id) return;
    setWishlistLoading(true);
    try {
      if (user) {
        if (isInWishlist) {
          await api.delete(`/auth/wishlist/${id}`);
          setIsInWishlist(false);
          success("Removed from wishlist");
        } else {
          await api.post("/auth/wishlist", { productId: id });
          setIsInWishlist(true);
          success("Added to wishlist");
        }
      } else {
        const saved = localStorage.getItem("wishlist");
        let ids = saved ? JSON.parse(saved) : [];

        if (isInWishlist) {
          ids = ids.filter((i: string) => i !== id);
          setIsInWishlist(false);
          success("Removed from wishlist");
        } else {
          ids.push(id);
          setIsInWishlist(true);
          success("Added to wishlist");
        }
        localStorage.setItem("wishlist", JSON.stringify(ids));
      }
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleAddToCart = async () => {
    if (!user) {
      sessionStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product!._id,
        quantity: quantity,
        returnTo: `/product/${id}`
      }));
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    try {
      await addToCart(product!._id, quantity);
      success("Added to cart!");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      sessionStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product!._id,
        quantity: quantity,
        returnTo: '/checkout'
      }));
      navigate("/login", { state: { from: '/checkout' } });
      return;
    }
    try {
      await addToCart(product!._id, quantity);
      success("Product added to cart!");
      navigate("/checkout");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
        <Card className="max-w-sm w-full mx-4">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="relative w-full aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-shimmer"></div>
              </div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Product Not Found
            </h2>
            <Button onClick={() => navigate("/products")}>
              Back to Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-1"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/products")}
          >
            Products
          </Button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-medium truncate">
            {product.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="relative group">
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                    <img
                      src={product.images[selectedImage] || "/placeholder.jpg"}
                      alt={product.title}
                      className="w-full h-full object-contain p-8 cursor-pointer transition-transform duration-300 group-hover:scale-110"
                      onClick={() => setShowImageModal(true)}
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 shadow-lg"
                      onClick={() => setShowImageModal(true)}
                    >
                      <ZoomIn className="w-5 h-5" />
                    </Button>

                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <Badge variant="destructive" className="text-lg px-6 py-3">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {product.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === idx
                            ? "border-[var(--root-color)] ring-2 ring-[var(--root-color)]/30 scale-105"
                            : "border-gray-200 dark:border-gray-600 hover:border-[var(--root-color)]/50"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.title} ${idx + 1}`}
                          className="w-full h-full object-contain p-1 bg-gray-50 dark:bg-gray-700"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Badge className="bg-gradient-to-r from-[var(--root-color)]/10 to-purple-600/10 text-[var(--root-color)] border-[var(--root-color)]/20">
                    {product.category}
                  </Badge>
                  <Badge variant={product.stock > 0 ? "success" : "destructive"}>
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </Badge>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {product.title}
                </h1>

                {reviewStats && reviewStats.totalReviews > 0 && (
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    {renderStars(Math.round(Number(reviewStats.averageRating)))}
                    <span className="text-base font-bold text-gray-900 dark:text-white">
                      {reviewStats.averageRating}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                )}

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold bg-gradient-to-r from-[var(--root-color)] to-purple-600 bg-clip-text text-transparent">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Inclusive of all taxes
                    </span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">
                    Quantity:
                  </span>
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-8 w-8"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-bold">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <SizeGuide />
                </div>

                {/* Action Buttons */}
                {product.stock > 0 ? (
                  <div className="flex gap-3 mb-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-[var(--root-color)] to-purple-600 hover:from-[var(--root-color)] hover:to-purple-700"
                      onClick={handleBuyNow}
                    >
                      Buy Now
                    </Button>
                    <Button
                      variant={isInWishlist ? "default" : "outline"}
                      size="icon"
                      onClick={toggleWishlist}
                      disabled={wishlistLoading}
                      className={isInWishlist ? "bg-red-500 hover:bg-red-600" : ""}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`} />
                    </Button>
                    <ShareProduct productTitle={product.title} />
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    <NotifyMe productId={product._id} productTitle={product.title} />
                    <div className="flex justify-center">
                      <ShareProduct productTitle={product.title} />
                    </div>
                  </div>
                )}

                <EstimatedDelivery />
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">Free Delivery</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">Secure Payment</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">Easy Returns</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <Tabs>
              <TabsList className="w-full justify-start">
                <TabsTrigger
                  active={activeTab === "description"}
                  onClick={() => setActiveTab("description")}
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  active={activeTab === "specifications"}
                  onClick={() => setActiveTab("specifications")}
                >
                  Specifications
                </TabsTrigger>
                <TabsTrigger
                  active={activeTab === "shipping"}
                  onClick={() => setActiveTab("shipping"}
                >
                  Shipping & Returns
                </TabsTrigger>
              </TabsList>

              {activeTab === "description" && (
                <TabsContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </TabsContent>
              )}

              {activeTab === "specifications" && (
                <TabsContent>
                  <div className="space-y-3">
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Category</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{product.category}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Stock Status</span>
                      <span className={`font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                        {product.stock > 0 ? `${product.stock} Available` : "Out of Stock"}
                      </span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-600 dark:text-gray-400">SKU</span>
                      <span className="font-mono font-semibold text-gray-900 dark:text-white">
                        {product._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </TabsContent>
              )}

              {activeTab === "shipping" && (
                <TabsContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Shipping Information</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Free standard shipping on all orders. Express delivery available at checkout.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Return Policy</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        30-day return policy. Items must be unused and in original packaging.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <div className="mt-8">
          <ProductReviews productId={product._id} />
        </div>

        {/* Recently Viewed */}
        <div className="mt-8">
          <RecentlyViewed />
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setShowImageModal(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full w-12 h-12"
          >
            <span className="text-2xl">&times;</span>
          </Button>

          <div className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center gap-4">
            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={product.images[selectedImage] || "/placeholder.jpg"}
                alt={product.title}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />

              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((prev) =>
                        prev === 0 ? product.images.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full w-14 h-14"
                  >
                    <ChevronRight className="w-7 h-7 rotate-180" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((prev) =>
                        prev === product.images.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full w-14 h-14"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </Button>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div
                className="flex gap-3 overflow-x-auto pb-2 px-4 max-w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-[var(--root-color)] ring-4 ring-[var(--root-color)]/50 scale-110"
                        : "border-gray-400 hover:border-[var(--root-color)]"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <Badge className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              {selectedImage + 1} / {product.images.length}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
