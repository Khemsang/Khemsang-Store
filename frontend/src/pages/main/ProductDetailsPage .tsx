import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import { useProduct } from "../../hooks/useProducts";
import ProductReviews from "../../components/sections/ProductReviews/ProductReviews";
import RecentlyViewed, { addToRecentlyViewed } from "../../components/sections/RecentlyViewed/RecentlyViewed";
import ShareProduct from "../../components/ui/ShareProduct";
import SizeGuide from "../../components/ui/SizeGuide";
import EstimatedDelivery from "../../components/ui/EstimatedDelivery";
import NotifyMe from "../../components/ui/NotifyMe";
import Loading from "../../components/common/Loading";
import { ImageSlideshow } from "../../components/ui/ImageSlideshow";
import { ColorSelector } from "../../components/ui/ColorSelector";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import { 
  Package, 
  ShoppingCart, 
  Heart, 
  Truck, 
  Shield, 
  RefreshCw,
  Star,
  Minus,
  Plus,
  Home,
  ChevronRight,
  ZoomIn
} from "lucide-react";

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

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  

  const { data: product, isLoading: loading, isError, refetch } = useProduct(id);
  

  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [variantQuantities, setVariantQuantities] = useState<Record<string, number>>({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [reviewStats, setReviewStats] = useState<{
    averageRating: number;
    totalReviews: number;
  } | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ColorVariant | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  

  const getAllImages = () => {
    const allImages: string[] = [];
    

    if (product?.images && product.images.length > 0) {
      allImages.push(...product.images);
    }
    

    if (product?.colorVariants && product.colorVariants.length > 0) {
      product.colorVariants.forEach((variant: ColorVariant) => {
        if (variant.images && variant.images.length > 0) {
          allImages.push(...variant.images);
        }
      });
    }
    
    return allImages;
  };
  
  const currentImages = getAllImages();
  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const currentPrice = selectedVariant?.price ?? product?.price ?? 0;

  useEffect(() => {
    if (product) {

      if (product.colorVariants && product.colorVariants.length > 0) {
        const firstActive = product.colorVariants.find((v: ColorVariant) => v.isActive);
        if (firstActive) {
          setSelectedVariant(firstActive);
        }
      }
    }
  }, [product]);

  useEffect(() => {
    fetchReviewStats();
    checkWishlist();
    if (id) {
      addToRecentlyViewed(id);
    }
  }, [id, user]);
  
  const handleVariantChange = (variant: ColorVariant) => {

    if (selectedVariant) {
      setVariantQuantities(prev => ({
        ...prev,
        [selectedVariant._id]: quantity
      }));
    }
    

    setSelectedVariant(variant);
    

    let imageIndex = 0;
    

    if (product?.images && product.images.length > 0) {
      imageIndex += product.images.length;
    }
    

    if (product?.colorVariants && product.colorVariants.length > 0) {
      for (const v of product.colorVariants) {
        if (v._id === variant._id) {

          break;
        }
        if (v.images && v.images.length > 0) {
          imageIndex += v.images.length;
        }
      }
    }
    

    setSelectedImage(imageIndex);
    

    const savedQuantity = variantQuantities[variant._id] || 0;
    setQuantity(savedQuantity);
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

  const handleAddToCart = useCallback(async () => {
    
    if (!user) {
      sessionStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product!._id,
        quantity: quantity,
        colorVariant: selectedVariant ? {
          colorName: selectedVariant.colorName,
          colorCode: selectedVariant.colorCode
        } : undefined,
        returnTo: `/product/${id}`
      }));
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    
    if (addingToCart) {
      return;
    }
    
    
    try {
      setAddingToCart(true);
      

      const variantInfo = selectedVariant ? {
        colorName: selectedVariant.colorName,
        colorCode: selectedVariant.colorCode
      } : undefined;
      
      const isExistingItem = cart.some((item) => {
        if (!item.product) {
          return false;
        }
        const sameProduct = item.product._id === product!._id;
        const sameVariant = variantInfo 
          ? (item.colorVariant?.colorName === variantInfo.colorName)
          : !item.colorVariant;
        return sameProduct && sameVariant;
      });
      

      await addToCart(product!._id, quantity, variantInfo);
      

      if (!isExistingItem) {
        success("Added to cart!");
      } else {
      }
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  }, [addingToCart, user, product, quantity, selectedVariant, id, navigate, addToCart, cart, success, error]);

  const handleAddAllVariantsToCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    
    if (!product?.colorVariants || product.colorVariants.length === 0) {
      error("No variants available");
      return;
    }

    try {
      let addedCount = 0;
      for (const variant of product.colorVariants) {
        if (variant.isActive && variant.stock > 0) {
          const qty = variantQuantities[variant._id] || 1;
          const variantInfo = {
            colorName: variant.colorName,
            colorCode: variant.colorCode
          };
          await addToCart(product._id, qty, variantInfo);
          addedCount++;
        }
      }
      success(`Added ${addedCount} variant(s) to cart!`);
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add variants to cart");
    }
  };

  const handleBuyNow = async () => {
    
    if (!user) {
      sessionStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product!._id,
        quantity: quantity,
        colorVariant: selectedVariant ? {
          colorName: selectedVariant.colorName,
          colorCode: selectedVariant.colorCode
        } : undefined,
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
      
      const variantInfo = selectedVariant ? {
        colorName: selectedVariant.colorName,
        colorCode: selectedVariant.colorCode
      } : undefined;
      
      

      const isExistingItem = cart.some((item) => {
        if (!item.product) {
          return false;
        }
        const sameProduct = item.product._id === product!._id;
        const sameVariant = variantInfo 
          ? (item.colorVariant?.colorName === variantInfo.colorName)
          : !item.colorVariant;
        return sameProduct && sameVariant;
      });
      
      

      await addToCart(product!._id, quantity, variantInfo);
      

      if (!isExistingItem) {
        success("Product added to cart!");
      } else {
      }
      
      navigate("/checkout");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <Loading text="Loading product details..." fullScreen={true} />;
  }

  if (isError || !product) {
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
          
          <div className="space-y-4">
            
            <Card>
              <CardContent className="p-5">
                
                <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 w-full h-[500px] mb-4">
                  <img
                    src={currentImages[selectedImage] || "/placeholder.jpg"}
                    alt={product.title}
                    className="w-full h-full object-contain transition-opacity duration-500 cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  />
                  
                  
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-4 right-4 w-10 h-10"
                    onClick={() => setShowImageModal(true)}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>

                  {currentStock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm rounded-lg">
                      <Badge variant="destructive" className="text-lg px-5 py-2.5">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>

                
                <div className="relative">
                  <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                    {(() => {

                      const allImages: Array<{ img: string; variantName: string; variantColor: string; idx: number }> = [];
                      

                      if (product.images && product.images.length > 0) {
                        product.images.forEach((img, idx) => {
                          allImages.push({
                            img,
                            variantName: 'Main',
                            variantColor: '#000000',
                            idx: allImages.length
                          });
                        });
                      }
                      

                      if (product.colorVariants && product.colorVariants.length > 0) {
                        product.colorVariants.forEach((variant: ColorVariant) => {
                          if (variant.images && variant.images.length > 0) {
                            variant.images.forEach((img) => {
                              allImages.push({
                                img,
                                variantName: variant.colorName,
                                variantColor: variant.colorCode,
                                idx: allImages.length
                              });
                            });
                          }
                        });
                      }
                      
                      return allImages.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedImage(idx);

                            const mainImagesCount = product.images?.length || 0;
                            if (idx >= mainImagesCount && product.colorVariants) {
                              let imageCount = mainImagesCount;
                              for (const variant of product.colorVariants) {
                                const variantImageCount = variant.images?.length || 0;
                                if (idx < imageCount + variantImageCount) {
                                  setSelectedVariant(variant);
                                  break;
                                }
                                imageCount += variantImageCount;
                              }
                            }
                          }}
                          className={`flex-shrink-0 w-18 h-18 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 snap-start ${
                            idx === selectedImage
                              ? "border-orange-500 ring-2 ring-orange-300"
                              : "border-gray-300 dark:border-gray-600 hover:border-orange-300"
                          }`}
                          title={item.variantName}
                        >
                          <img
                            src={item.img}
                            alt={`${item.variantName} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          
                          <div 
                            className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: item.variantColor }}
                          />
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            
            <Card>
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
                      onClick={() => setActiveTab("shipping")}
                    >
                      Shipping & Returns
                    </TabsTrigger>
                  </TabsList>

                  {activeTab === "description" && (
                    <TabsContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Product Description</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                          {product.description}
                        </p>
                        
                        {product.shortDescription && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                              {product.shortDescription}
                            </p>
                          </div>
                        )}

                        {product.features && product.features.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Key Features</h4>
                            <ul className="space-y-1">
                              {product.features.map((feature: string, index: number) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                  <span className="text-blue-600 mt-0.5">✓</span>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  )}

                  {activeTab === "specifications" && (
                    <TabsContent>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Product Specifications</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{product.category}</span>
                        </div>
                        
                        {product.brand && (
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Brand</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{product.brand}</span>
                          </div>
                        )}

                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock Status</span>
                          <span className={`text-sm font-bold ${currentStock > 0 ? "text-green-600" : "text-red-600"}`}>
                            {currentStock > 0 ? `${currentStock} Available` : "Out of Stock"}
                          </span>
                        </div>

                        {selectedVariant && (
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Selected Color</span>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: selectedVariant.colorCode }}
                              />
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {selectedVariant.colorName}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  )}

                  {activeTab === "shipping" && (
                    <TabsContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Shipping Information</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            Free standard shipping on all orders. Express delivery available at checkout.
                          </p>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Return Policy</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            30-day return policy. Items must be unused and in original packaging.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Badge className="bg-gradient-to-r from-[var(--root-color)]/10 to-purple-600/10 text-[var(--root-color)] border-[var(--root-color)]/20">
                    {product.category}
                  </Badge>
                  <Badge variant={currentStock > 0 ? "success" : "destructive"}>
                    {currentStock > 0 ? `${currentStock} in stock` : "Out of stock"}
                  </Badge>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {product.title}
                </h1>

                {reviewStats && reviewStats.totalReviews > 0 && (
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    {renderStars(Math.round(Number(reviewStats.averageRating)))}
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {reviewStats.averageRating}
                    </span>
                    <span className="text-base text-gray-500 dark:text-gray-400">
                      ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                )}

                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 mb-6 border-2 border-blue-100 dark:border-blue-800">
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Price</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        Rs. {currentPrice.toLocaleString()}
                      </span>
                      {product.discount > 0 && (
                        <Badge className="bg-red-500 text-white text-sm px-3 py-1">
                          {product.discount}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>

                  
                  {product.originalPrice && product.originalPrice > currentPrice && (
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Original Price</p>
                        <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                          Rs. {product.originalPrice.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">You Save</p>
                        <span className="text-xl font-semibold text-green-600 dark:text-green-400">
                          Rs. {(product.originalPrice - currentPrice).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-blue-200 dark:border-blue-800">
                    <Shield className="w-4 h-4" />
                    <span>Inclusive of all taxes</span>
                  </div>
                </div>

                
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Stock Status</p>
                      <p className={`text-lg font-bold ${currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {currentStock > 0 ? `${currentStock} units available` : 'Out of Stock'}
                      </p>
                    </div>
                    {currentStock > 0 && currentStock <= 10 && (
                      <Badge className="bg-orange-500 text-white">
                        Only {currentStock} left!
                      </Badge>
                    )}
                  </div>
                </div>

                
                {product.colorVariants && product.colorVariants.length > 0 ? (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Available Colors ({product.colorVariants.length})
                    </h3>
                    <ColorSelector
                      variants={product.colorVariants}
                      selectedVariant={selectedVariant}
                      onSelectVariant={handleVariantChange}
                    />
                  </div>
                ) : (
                  <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      No color variants available for this product
                    </p>
                  </div>
                )}

                
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">
                    Quantity:
                  </span>
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newQty = Math.max(0, quantity - 1);
                        setQuantity(newQty);
                        if (selectedVariant) {
                          setVariantQuantities(prev => ({
                            ...prev,
                            [selectedVariant._id]: newQty
                          }));
                        }
                      }}
                      disabled={quantity === 0}
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
                      onClick={() => {
                        const newQty = Math.min(currentStock, quantity + 1);
                        setQuantity(newQty);
                        if (selectedVariant) {
                          setVariantQuantities(prev => ({
                            ...prev,
                            [selectedVariant._id]: newQty
                          }));
                        }
                      }}
                      disabled={quantity >= currentStock}
                      className="h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <SizeGuide />
                </div>

                
                {currentStock > 0 ? (
                  <div className="space-y-3 mb-4">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleAddToCart}
                        disabled={addingToCart || quantity === 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {addingToCart ? "Adding..." : quantity === 0 ? "Select Quantity" : "Add to Cart"}
                      </Button>
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={handleBuyNow}
                        disabled={quantity === 0}
                      >
                        {quantity === 0 ? "Select Quantity" : "Buy Now"}
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
                    
                    
                    {product.colorVariants && product.colorVariants.length > 0 && Object.keys(variantQuantities).length > 0 && (
                      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Selected Variants Summary
                          </h4>
                          <div className="space-y-2">
                            {product.colorVariants
                              .filter((v: ColorVariant) => variantQuantities[v._id] && variantQuantities[v._id] > 0)
                              .map((variant: ColorVariant) => (
                                <div key={variant._id} className="flex items-center justify-between text-sm bg-white dark:bg-gray-800 p-2 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-4 h-4 rounded-full border-2 border-gray-300"
                                      style={{ backgroundColor: variant.colorCode }}
                                    />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {variant.colorName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      Qty: {variantQuantities[variant._id]}
                                    </span>
                                    <span className="font-bold text-green-600">
                                      Rs. {((variant.price || currentPrice) * variantQuantities[variant._id]).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            <Separator className="my-2" />
                            <div className="flex items-center justify-between font-bold text-base pt-2">
                              <span className="text-gray-900 dark:text-white">
                                Total ({Object.values(variantQuantities).reduce((sum, qty) => sum + qty, 0)} units)
                              </span>
                              <span className="text-green-600 text-lg">
                                Rs. {product.colorVariants
                                  .filter((v: ColorVariant) => variantQuantities[v._id])
                                  .reduce((sum: number, v: ColorVariant) => 
                                    sum + ((v.price || currentPrice) * (variantQuantities[v._id] || 0)), 0
                                  ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
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
                  onClick={() => setActiveTab("shipping")}
                >
                  Shipping & Returns
                </TabsTrigger>
              </TabsList>

              {activeTab === "description" && (
                <TabsContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Description</h3>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                    
                    {product.shortDescription && (
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-base text-gray-700 dark:text-gray-300 font-medium">
                          {product.shortDescription}
                        </p>
                      </div>
                    )}

                    {product.features && product.features.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Key Features</h4>
                        <ul className="space-y-2">
                          {product.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-base text-gray-700 dark:text-gray-300">
                              <span className="text-blue-600 mt-1">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {activeTab === "specifications" && (
                <TabsContent>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Product Specifications</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-4 border-b-2 border-gray-200 dark:border-gray-700">
                      <span className="text-base font-medium text-gray-600 dark:text-gray-400">Category</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{product.category}</span>
                    </div>
                    
                    {product.brand && (
                      <div className="flex justify-between py-4 border-b-2 border-gray-200 dark:border-gray-700">
                        <span className="text-base font-medium text-gray-600 dark:text-gray-400">Brand</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{product.brand}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-4 border-b-2 border-gray-200 dark:border-gray-700">
                      <span className="text-base font-medium text-gray-600 dark:text-gray-400">Stock Status</span>
                      <span className={`text-lg font-bold ${currentStock > 0 ? "text-green-600" : "text-red-600"}`}>
                        {currentStock > 0 ? `${currentStock} Available` : "Out of Stock"}
                      </span>
                    </div>

                    {product.specifications && (
                      <>
                        {product.specifications.weight && (
                          <div className="flex justify-between py-4 border-b-2 border-gray-200 dark:border-gray-700">
                            <span className="text-base font-medium text-gray-600 dark:text-gray-400">Weight</span>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">{product.specifications.weight}</span>
                          </div>
                        )}
                        {product.specifications.dimensions && (
                          <div className="flex justify-between py-4 border-b-2 border-gray-200 dark:border-gray-700">
                            <span className="text-base font-medium text-gray-600 dark:text-gray-400">Dimensions</span>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">{product.specifications.dimensions}</span>
                          </div>
                        )}
                        {product.specifications.material && (
                          <div className="flex justify-between py-4 border-b-2 border-gray-200 dark:border-gray-700">
                            <span className="text-base font-medium text-gray-600 dark:text-gray-400">Material</span>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">{product.specifications.material}</span>
                          </div>
                        )}
                        {product.specifications.color && (
                          <div className="flex justify-between py-4 border-b-2 border-gray-200 dark:border-gray-700">
                            <span className="text-base font-medium text-gray-600 dark:text-gray-400">Color</span>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">{product.specifications.color}</span>
                          </div>
                        )}
                      </>
                    )}

                    {selectedVariant && (
                      <>
                        <div className="flex justify-between py-4 border-b-2 border-gray-200 dark:border-gray-700">
                          <span className="text-base font-medium text-gray-600 dark:text-gray-400">Selected Color</span>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: selectedVariant.colorCode }}
                            />
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {selectedVariant.colorName}
                            </span>
                          </div>
                        </div>
                        {selectedVariant.sku && (
                          <div className="flex justify-between py-4 border-b-2 border-gray-200 dark:border-gray-700">
                            <span className="text-base font-medium text-gray-600 dark:text-gray-400">Variant SKU</span>
                            <span className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                              {selectedVariant.sku}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {product.warranty && (
                      <div className="flex justify-between py-4 border-b-2 border-gray-200 dark:border-gray-700">
                        <span className="text-base font-medium text-gray-600 dark:text-gray-400">Warranty</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{product.warranty}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-4">
                      <span className="text-base font-medium text-gray-600 dark:text-gray-400">Product ID</span>
                      <span className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
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

        
        <div className="mt-8">
          <ProductReviews productId={product._id} />
        </div>

        
        <div className="mt-8">
          <RecentlyViewed />
        </div>
      </div>

      
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setShowImageModal(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full w-12 h-12 z-10"
          >
            <span className="text-2xl">&times;</span>
          </Button>

          <div className="relative max-w-3xl w-full flex flex-col items-center gap-4">
            <div
              className="relative w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentImages[selectedImage] || "/placeholder.jpg"}
                alt={product.title}
                className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
              />

              {currentImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((prev) =>
                        prev === 0 ? currentImages.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full w-12 h-12"
                  >
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((prev) =>
                        prev === currentImages.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full w-12 h-12"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>

            {currentImages.length > 1 && (
              <div
                className="flex gap-2 overflow-x-auto pb-2 px-4 max-w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-orange-500 ring-2 ring-orange-300 scale-110"
                        : "border-gray-400 hover:border-orange-300"
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
              {selectedImage + 1} / {currentImages.length}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
