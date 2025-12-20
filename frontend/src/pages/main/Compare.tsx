import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBalanceScale,
  FaTrash,
  FaShoppingCart,
  FaPlus,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description?: string;
  rating?: number;
  numReviews?: number;
  stock?: number;
  brand?: string;
  category?: string;
}

const Compare = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("compareProducts");
    if (stored) {
      setProducts(JSON.parse(stored));
    }
  }, []);

  const removeProduct = (productId: string) => {
    const updated = products.filter((p) => p._id !== productId);
    setProducts(updated);
    localStorage.setItem("compareProducts", JSON.stringify(updated));
    showToast("Product removed from comparison", "success");
  };

  const clearAll = () => {
    setProducts([]);
    localStorage.removeItem("compareProducts");
    showToast("Comparison cleared", "success");
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    showToast(`${product.title} added to cart!`, "success");
  };

  const compareFields = [
    {
      key: "price",
      label: "Price",
      render: (p: Product) => `Rs. ${p.price.toLocaleString()}`,
    },
    {
      key: "originalPrice",
      label: "Original Price",
      render: (p: Product) =>
        p.originalPrice ? `Rs. ${p.originalPrice.toLocaleString()}` : "-",
    },
    {
      key: "rating",
      label: "Rating",
      render: (p: Product) => (p.rating ? `${p.rating} ⭐` : "N/A"),
    },
    {
      key: "numReviews",
      label: "Reviews",
      render: (p: Product) => p.numReviews || 0,
    },
    {
      key: "stock",
      label: "Availability",
      render: (p: Product) => (
        <span
          className={p.stock && p.stock > 0 ? "text-green-600" : "text-red-600"}
        >
          {p.stock && p.stock > 0 ? "In Stock" : "Out of Stock"}
        </span>
      ),
    },
    { key: "brand", label: "Brand", render: (p: Product) => p.brand || "-" },
    {
      key: "category",
      label: "Category",
      render: (p: Product) => p.category || "-",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <FaBalanceScale className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Compare Products
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Compare up to 4 products side by side
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <FaBalanceScale className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No Products to Compare
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add products to compare from the products page
            </p>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* Clear All Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <FaTrash className="w-4 h-4" />
                Clear All
              </button>
            </div>

            {/* Comparison Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-4 text-left bg-gray-50 dark:bg-gray-700/50 sticky left-0 z-10 min-w-[150px]">
                        Feature
                      </th>
                      {products.map((product) => (
                        <th key={product._id} className="p-4 min-w-[250px]">
                          <div className="relative">
                            <button
                              onClick={() => removeProduct(product._id)}
                              className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                            <img
                              src={product.images?.[0] || "/placeholder.jpg"}
                              alt={product.title}
                              className="w-32 h-32 object-cover rounded-xl mx-auto mb-3 cursor-pointer hover:scale-105 transition-transform"
                              onClick={() =>
                                navigate(`/product/${product._id}`)
                              }
                            />
                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm">
                              {product.title}
                            </h3>
                          </div>
                        </th>
                      ))}
                      {products.length < 4 && (
                        <th className="p-4 min-w-[200px]">
                          <button
                            onClick={() => navigate("/products")}
                            className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center mx-auto hover:border-purple-500 transition-colors group"
                          >
                            <FaPlus className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mb-2" />
                            <span className="text-sm text-gray-500 group-hover:text-purple-500">
                              Add Product
                            </span>
                          </button>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {compareFields.map((field, idx) => (
                      <tr
                        key={field.key}
                        className={
                          idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-700/30" : ""
                        }
                      >
                        <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-inherit">
                          {field.label}
                        </td>
                        {products.map((product) => (
                          <td
                            key={product._id}
                            className="p-4 text-center text-gray-600 dark:text-gray-400"
                          >
                            {field.render(product)}
                          </td>
                        ))}
                        {products.length < 4 && <td></td>}
                      </tr>
                    ))}
                    {/* Add to Cart Row */}
                    <tr className="bg-purple-50 dark:bg-purple-900/20">
                      <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-inherit">
                        Action
                      </td>
                      {products.map((product) => (
                        <td key={product._id} className="p-4 text-center">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.stock || product.stock === 0}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            <FaShoppingCart />
                            Add to Cart
                          </button>
                        </td>
                      ))}
                      {products.length < 4 && <td></td>}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Compare;
