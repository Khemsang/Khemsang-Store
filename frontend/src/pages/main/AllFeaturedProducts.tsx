import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, ShoppingCart, ArrowLeft } from "lucide-react";
import { api } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Loading } from "../../components/ui/loading";

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

const AllFeaturedProducts = () => {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    fetchAllFeaturedProducts();
  }, []);

  const fetchAllFeaturedProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/featured-products");
      console.log("Featured products data:", data);
      const activeProducts = data
        .filter((item: FeaturedProduct) => item.isActive)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      console.log("Active products:", activeProducts);
      console.log("First product image:", activeProducts[0]?.image);
      setProducts(activeProducts);
    } catch (error) {
      console.error("Error fetching featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: FeaturedProduct) => {
    if (product.productId) {
      try {
        await addToCart(product.productId, 1);
        showToast(`${product.title} added to cart!`, "success");
      } catch (error) {
        showToast("Failed to add to cart", "error");
      }
    } else {
      navigate(`/featured/${product._id}`);
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
    <section className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-orange-600 text-white">
            <Star className="w-4 h-4 mr-1" />
            Featured Collection
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
            All Featured Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Discover our complete collection of premium featured products
          </p>
        </div>

        {/* Products Grid */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product._id} className="group overflow-hidden hover:shadow-xl transition-all">
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                    {imageErrors[product._id] ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-16 h-16 text-gray-400" />
                      </div>
                    ) : (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => navigate(`/featured/${product._id}`)}
                        onError={(e) => {
                          console.error("Image failed to load:", product.image);
                          handleImageError(product._id);
                        }}
                        onLoad={() => console.log("Image loaded successfully:", product.image)}
                      />
                    )}
                    {product.discount && product.discount > 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                        -{product.discount}%
                      </Badge>
                    )}
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-orange-600 text-white">
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
                      disabled={!product.productId}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.productId ? "Add to Cart" : "View Details"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Back Button */}
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
