import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, ShoppingCart, ArrowLeft, Flame, TrendingUp, Sparkles } from "lucide-react";
import { api } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Loading } from "../../components/ui/loading";
import SimpleProductCard from "../../components/products/SimpleProductCard";
import FlashProductCard from "../../components/products/FlashProductCard";

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
  isActive: boolean;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  image?: string;
  stock?: number;
  discount?: number;
  rating?: number;
  numReviews?: number;
  flashEndTime?: string;
  isFlashSale?: boolean;
  flashStock?: number;
}

const AllFeaturedProducts = () => {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [flashProducts, setFlashProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAllFeaturedProducts(),
        fetchFlashSales(),
        fetchLatestProducts(),
        fetchTopSellingProducts()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFeaturedProducts = async () => {
    try {
      const { data } = await api.get("/featured-products");
      const activeProducts = data
        .filter((item: FeaturedProduct) => item.isActive)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      setProducts(activeProducts);
    } catch (error) {
      showToast("Failed to load featured products", "error");
    }
  };

  const fetchFlashSales = async () => {
    try {
      const { data } = await api.get("/flash-sales/home?limit=8");
      setFlashProducts(data);
    } catch (error) {

    }
  };

  const fetchLatestProducts = async () => {
    try {
      const { data } = await api.get("/products?sort=-createdAt&limit=8");
      setLatestProducts(data.products || data);
    } catch (error) {

    }
  };

  const fetchTopSellingProducts = async () => {
    try {
      const { data } = await api.get("/products?sort=-sold&limit=8");
      setTopSellingProducts(data.products || data);
    } catch (error) {

    }
  };

  const handleAddToCartProduct = async (product: Product) => {
    try {
      const result = await addToCart(product._id, 1);
      if (result.isNew) {
        showToast("Added to cart!", "success");
      } else {
        showToast("Quantity updated in cart", "info");
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to add to cart", "error");
    }
  };

  const handleAddToCart = async (product: FeaturedProduct) => {
    if (!product.productId) {
      showToast("This product is not available for purchase", "error");
      return;
    }

    try {
      await addToCart(product.productId, 1);
      showToast("Added to cart!", "success");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to add to cart", "error");
    }
  };

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 flex items-center justify-center">
        <Loading variant="product" />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-600 text-white">
            <Star className="w-4 h-4 mr-1" />
            Featured Collection
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-blue-600 bg-clip-text text-transparent">
            All Featured Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Discover our complete collection of premium featured products
          </p>
        </div>

        
        {products.length === 0 ? (
          <Card className="text-center py-20">
            <ShoppingCart className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No featured products available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Check back later for new featured products
            </p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-16">
              {products.map((product) => (
                <Card key={product._id} className="group overflow-hidden hover:shadow-xl transition-all">
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                    {imageErrors[product._id] ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <ShoppingCart className="w-16 h-16 mb-2" />
                        <span className="text-sm">Image not available</span>
                      </div>
                    ) : (
                      <img
                        src={product.image || '/placeholder-image.jpg'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => navigate(`/featured/${product._id}`)}
                        onError={() => handleImageError(product._id)}
                      />
                    )}
                    {product.discount && product.discount > 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                        -{product.discount}%
                      </Badge>
                    )}
                    <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  <div className="p-4">
                    <Badge variant="info" className="mb-2 text-xs">
                      {product.category}
                    </Badge>
                    <h3
                      className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
                      onClick={() => navigate(`/featured/${product._id}`)}
                    >
                      {product.title}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          Rs. {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="w-full"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            
            {flashProducts.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <Flame className="w-8 h-8 text-orange-500" />
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Flash Sale
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {flashProducts.map((product, index) => {
                    const colorSchemes: Array<"blue" | "purple" | "orange"> = ["blue", "purple", "orange"];
                    const colorScheme = colorSchemes[index % 3];
                    
                    return (
                      <FlashProductCard
                        key={product._id}
                        product={product}
                        onAddToCart={handleAddToCartProduct}
                        colorScheme={colorScheme}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            
            {latestProducts.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-8 h-8 text-blue-500" />
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Latest Products
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {latestProducts.map((product) => (
                    <SimpleProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={handleAddToCartProduct}
                      showOriginalPrice={true}
                      showColorVariants={true}
                    />
                  ))}
                </div>
              </div>
            )}

            
            {topSellingProducts.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Top Selling Products
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {topSellingProducts.map((product) => (
                    <SimpleProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={handleAddToCartProduct}
                      showOriginalPrice={true}
                      showColorVariants={true}
                    />
                  ))}
                </div>
              </div>
            )}

            
            <div className="text-center mt-12">
              <Button variant="outline" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AllFeaturedProducts;
