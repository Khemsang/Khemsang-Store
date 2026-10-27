import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useMinimumLoading } from "../../hooks/useMinimumLoading";
import Loading from "../../components/common/Loading";
import {
  FaBox,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaSort,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

interface Product {
  _id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
}

const AdminInventory = () => {
  const { success, error } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumLoading(loading, 1000);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [sortBy, setSortBy] = useState<"stock" | "title">("stock");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(Array.isArray(data) ? data : (data.products ?? []));
    } catch (err) {
      error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId: string) => {
    try {
      await api.put(`/products/${productId}`, { stock: editStock });
      setProducts(
        products.map((p) =>
          p._id === productId ? { ...p, stock: editStock } : p
        )
      );
      success("Stock updated successfully");
      setEditingId(null);
    } catch (err) {
      error("Failed to update stock");
    }
  };

 
const safeProducts = Array.isArray(products) ? products : [];

const search = searchTerm.toLowerCase();

const filteredProducts = safeProducts
  .filter((p) => {
    if (filter === "low") {
      return p.stock > 0 && p.stock <= lowStockThreshold;
    }

    if (filter === "out") {
      return p.stock === 0;
    }

    return true;
  })
  .filter(
    (p) =>
      p.title.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search)
  )
  .sort((a, b) => {
    if (sortBy === "stock") return a.stock - b.stock;
    return a.title.localeCompare(b.title);
  });

const stats = {
  total: safeProducts.length,
  inStock: safeProducts.filter(
    (p) => p.stock > lowStockThreshold
  ).length,
  lowStock: safeProducts.filter(
    (p) => p.stock > 0 && p.stock <= lowStockThreshold
  ).length,
  outOfStock: safeProducts.filter(
    (p) => p.stock === 0
  ).length,
};


  if (showLoading) {
    return <Loading text="Loading inventory..." fullScreen={true} />;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-900 h-full ">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventory Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage product stock levels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Low stock threshold:
          </span>
          <input
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FaBox className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Products
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FaCheckCircle className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.inStock}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                In Stock
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.lowStock}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Low Stock
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <FaTimes className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.outOfStock}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Out of Stock
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "low", "out"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? "bg-[var(--root-color)] text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {f === "all"
                  ? "All"
                  : f === "low"
                  ? "Low Stock"
                  : "Out of Stock"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortBy(sortBy === "stock" ? "title" : "stock")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <FaSort />
            Sort by {sortBy === "stock" ? "Stock" : "Name"}
          </button>
        </div>
      </div>

      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {product.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                    Rs. {product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === product._id ? (
                      <input
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(Number(e.target.value))}
                        className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="0"
                      />
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white">
                        {product.stock}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {product.stock === 0 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Out of Stock
                      </span>
                    ) : product.stock <= lowStockThreshold ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === product._id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStock(product._id)}
                          className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                        >
                          <FaSave />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(product._id);
                          setEditStock(product.stock);
                        }}
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                      >
                        <FaEdit />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <FaBox className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No products found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
