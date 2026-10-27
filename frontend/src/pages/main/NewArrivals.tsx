import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { api } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import SimpleProductCard from "../../components/products/SimpleProductCard";

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  stock: number;
  createdAt: string;
}

const NewArrivals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart } = useCart();
  const { showToast } = useToast();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      const { data: productsRes } = await api.get("/products");
      const data = Array.isArray(productsRes) ? productsRes : (productsRes.products ?? []);

      const sorted = data
        .sort(
          (a: Product, b: Product) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 20);
      setProducts(sorted);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: any) => {

    if (addingToCart === product._id) {
      return;
    }

    try {
      setAddingToCart(product._id);
      

      const isExistingItem = cart.some((item) => {
        return item.product?._id === product._id && !item.colorVariant;
      });
      
      await addToCart(product._id, 1);
      

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
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <FaStar className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              New Arrivals
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Check out our latest products fresh from the collection
          </p>
        </div>

        
        {products.length === 0 ? (
          <div className="text-center py-20">
            <FaStar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No New Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for new arrivals
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {products.map((product, index) => (
              <SimpleProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                showOriginalPrice={true}
                showColorVariants={true}
                badge={
                  index < 5 ? (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded flex items-center gap-0.5">
                      <FaStar className="w-2.5 h-2.5" />
                      NEW
                    </span>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewArrivals;
