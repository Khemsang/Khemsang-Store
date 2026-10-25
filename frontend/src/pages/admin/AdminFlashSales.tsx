import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FaFire, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaClock, 
  FaPercentage,
  FaBox,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Loading from "../../components/common/Loading";

interface Product {
  _id: string;
  title: string;
  price: number;
  stock: number;
  images: string[];
  isFlashSale: boolean;
  flashDiscountType?: string;
  flashDiscountValue?: number;
  flashStartTime?: string;
  flashEndTime?: string;
  flashStock?: number;
  flashPrice?: number;
  colorVariants?: Array<{
    colorName: string;
    colorCode: string;
    images?: string[];
    sku?: string;
    price?: number;
    stock: number;
    isActive: boolean;
    isFlashSale?: boolean;
    flashDiscountType?: string;
    flashDiscountValue?: number;
    flashStartTime?: string;
    flashEndTime?: string;
    flashStock?: number;
  }>;
}

const AdminFlashSales = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [flashSales, setFlashSales] = useState<{
    active: Product[];
    upcoming: Product[];
    expired: Product[];
  }>({ active: [], upcoming: [], expired: [] });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "expired">("active");
  
  const [formData, setFormData] = useState({
    productId: "",
    flashDiscountType: "percentage",
    flashDiscountValue: 0,
    flashStartTime: "",
    flashEndTime: "",
    flashStock: 0,
    variantColorName: "", // For variant-specific flash sale
  });

  const { success, error } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchFlashSales();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products?adminOnly=true");
      setProducts(Array.isArray(data) ? data : (data.products ?? []));
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchFlashSales = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/flash-sales/admin/all");
      setFlashSales(data);
    } catch (err) {
      console.error("Error fetching flash sales:", err);
      error("Failed to fetch flash sales");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlashSale = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await api.post("/flash-sales/create", formData);
      success("Flash sale created successfully!");
      setShowCreateModal(false);
      resetForm();
      fetchFlashSales();
      fetchProducts();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to create flash sale");
    }
  };

  const handleDisableFlashSale = async (productId: string) => {
    if (!confirm("Are you sure you want to disable this flash sale?")) return;

    try {
      await api.patch(`/flash-sales/update/${productId}`, { isFlashSale: false });
      success("Flash sale disabled successfully!");
      fetchFlashSales();
      fetchProducts();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to disable flash sale");
    }
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      flashDiscountType: "percentage",
      flashDiscountValue: 0,
      flashStartTime: "",
      flashEndTime: "",
      flashStock: 0,
      variantColorName: "",
    });
    setSelectedProduct(null);
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setSelectedProduct(product);
      setFormData(prev => ({
        ...prev,
        productId,
        flashStock: Math.min(10, product.stock),
        variantColorName: "", // Reset variant selection
      }));
    }
  };

  const handleVariantSelect = (variantColorName: string) => {
    if (!selectedProduct) return;
    
    if (variantColorName === "") {
      // Product-level flash sale
      setFormData(prev => ({
        ...prev,
        variantColorName: "",
        flashStock: Math.min(10, selectedProduct.stock),
      }));
    } else {
      // Variant-specific flash sale
      const variant = selectedProduct.colorVariants?.find(v => v.colorName === variantColorName);
      if (variant) {
        setFormData(prev => ({
          ...prev,
          variantColorName,
          flashStock: Math.min(10, variant.stock),
        }));
      }
    }
  };

  const getSelectedPrice = () => {
    if (!selectedProduct) return 0;
    if (formData.variantColorName) {
      const variant = selectedProduct.colorVariants?.find(v => v.colorName === formData.variantColorName);
      return variant?.price || selectedProduct.price;
    }
    return selectedProduct.price;
  };

  const getSelectedStock = () => {
    if (!selectedProduct) return 0;
    if (formData.variantColorName) {
      const variant = selectedProduct.colorVariants?.find(v => v.colorName === formData.variantColorName);
      return variant?.stock || 0;
    }
    return selectedProduct.stock;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <FaFire className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Flash Sale Management
            </h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold shadow-lg"
          >
            <FaPlus /> Create Flash Sale
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "active"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-600 dark:text-gray-400 hover:text-orange-500"
            }`}
          >
            Active ({flashSales.active.length})
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "upcoming"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-600 dark:text-gray-400 hover:text-blue-500"
            }`}
          >
            Upcoming ({flashSales.upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab("expired")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "expired"
                ? "text-gray-500 border-b-2 border-gray-500"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-500"
            }`}
          >
            Expired ({flashSales.expired.length})
          </button>
        </div>

        {/* Flash Sales List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashSales[activeTab].map((product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                  {product.flashDiscountType === "percentage"
                    ? `-${product.flashDiscountValue}%`
                    : `-Rs. ${product.flashDiscountValue}`}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {product.title}
                </h3>

                {/* Show variant info if it's a variant-specific flash sale */}
                {product.colorVariants?.some(v => v.isFlashSale) && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                      Variant Flash Sales:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.colorVariants
                        .filter(v => v.isFlashSale)
                        .map((variant, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg"
                          >
                            <div
                              className="w-4 h-4 rounded-full border border-white"
                              style={{ backgroundColor: variant.colorCode }}
                            />
                            <span className="text-xs font-medium">{variant.colorName}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Original Price:</span>
                    <span className="font-semibold line-through">Rs. {product.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Flash Price:</span>
                    <span className="font-bold text-orange-500 text-lg">
                      Rs. {product.flashPrice || product.price}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Flash Stock:</span>
                    <span className="font-semibold">{product.flashStock} / {product.stock}</span>
                  </div>
                </div>

                {product.flashEndTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <FaClock />
                    <span>
                      {activeTab === "active" && `Ends in: ${getTimeRemaining(product.flashEndTime)}`}
                      {activeTab === "upcoming" && `Starts: ${formatDateTime(product.flashStartTime!)}`}
                      {activeTab === "expired" && `Ended: ${formatDateTime(product.flashEndTime)}`}
                    </span>
                  </div>
                )}

                {activeTab !== "expired" && (
                  <button
                    onClick={() => handleDisableFlashSale(product._id)}
                    className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaTimesCircle /> Disable Flash Sale
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {flashSales[activeTab].length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No {activeTab} flash sales found
            </p>
          </div>
        )}

        {/* Create Flash Sale Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full my-8"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaFire className="w-8 h-8 text-white" />
                    <h2 className="text-2xl font-bold text-white">
                      Create Flash Sale
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <FaTimesCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateFlashSale} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                {/* Product Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Select Product *
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  >
                    <option value="">Choose a product...</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.title} {product.isFlashSale ? '🔥 (Already in Flash Sale)' : ''} (Stock: {product.stock}, Price: Rs. {product.price})
                      </option>
                    ))}
                  </select>
                  {selectedProduct?.isFlashSale && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
                      <FaFire className="text-yellow-600 dark:text-yellow-400" />
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                        This product already has an active flash sale. Creating a new one will replace the existing flash sale.
                      </p>
                    </div>
                  )}
                </div>

                {selectedProduct && (
                  <>
                    {/* Product Preview Card */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border-2 border-orange-200 dark:border-orange-700">
                      <div className="flex gap-4">
                        <img
                          src={selectedProduct.images[0]}
                          alt={selectedProduct.title}
                          className="w-24 h-24 object-cover rounded-lg shadow-md"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                            {selectedProduct.title}
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-700 dark:text-gray-300">
                              <span className="font-semibold">Price:</span> Rs. {getSelectedPrice()}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                              <span className="font-semibold">Available Stock:</span> {getSelectedStock()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Variant Selection (if product has variants) */}
                    {selectedProduct.colorVariants && selectedProduct.colorVariants.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Apply Flash Sale To
                        </label>
                        <select
                          value={formData.variantColorName}
                          onChange={(e) => handleVariantSelect(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                        >
                          <option value="">Entire Product (All Variants)</option>
                          {selectedProduct.colorVariants
                            .filter(v => v.isActive && !v.isFlashSale)
                            .map((variant) => (
                              <option key={variant.colorName} value={variant.colorName}>
                                {variant.colorName} (Stock: {variant.stock}, Price: Rs. {variant.price || selectedProduct.price})
                              </option>
                            ))}
                        </select>
                        {formData.variantColorName && (
                          <div className="flex items-center gap-2 mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                            <FaCheckCircle className="text-blue-600 dark:text-blue-400" />
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                              Flash sale will apply only to the {formData.variantColorName} variant
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Discount Type */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Discount Type *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.flashDiscountType === "percentage"
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/30"
                            : "border-gray-300 dark:border-gray-600 hover:border-orange-300"
                        }`}>
                          <input
                            type="radio"
                            value="percentage"
                            checked={formData.flashDiscountType === "percentage"}
                            onChange={(e) => setFormData({ ...formData, flashDiscountType: e.target.value, flashDiscountValue: 0 })}
                            className="w-5 h-5 text-orange-500"
                          />
                          <FaPercentage className="text-orange-500" />
                          <span className="font-semibold">Percentage</span>
                        </label>
                        <label className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.flashDiscountType === "flat"
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/30"
                            : "border-gray-300 dark:border-gray-600 hover:border-orange-300"
                        }`}>
                          <input
                            type="radio"
                            value="flat"
                            checked={formData.flashDiscountType === "flat"}
                            onChange={(e) => setFormData({ ...formData, flashDiscountType: e.target.value, flashDiscountValue: 0 })}
                            className="w-5 h-5 text-orange-500"
                          />
                          <span className="font-semibold">Flat (Rs.)</span>
                        </label>
                      </div>
                    </div>

                    {/* Discount Value */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Discount Value * {formData.flashDiscountType === "percentage" && "(Max: 100%)"}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.flashDiscountValue}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            const maxValue = formData.flashDiscountType === "percentage" ? 100 : getSelectedPrice() - 1;
                            setFormData({ ...formData, flashDiscountValue: Math.min(value, maxValue) });
                          }}
                          min="1"
                          max={formData.flashDiscountType === "percentage" ? 100 : getSelectedPrice() - 1}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                          placeholder={formData.flashDiscountType === "percentage" ? "Enter percentage (1-100)" : "Enter amount"}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                          {formData.flashDiscountType === "percentage" ? "%" : "Rs."}
                        </span>
                      </div>
                      {formData.flashDiscountValue > 0 && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border-2 border-green-200 dark:border-green-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Original Price</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white line-through">
                                Rs. {getSelectedPrice()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Flash Price</p>
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                Rs.{" "}
                                {formData.flashDiscountType === "percentage"
                                  ? Math.round(getSelectedPrice() * (1 - formData.flashDiscountValue / 100))
                                  : getSelectedPrice() - formData.flashDiscountValue}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <span className="inline-block px-3 py-1 bg-green-600 text-white rounded-full text-sm font-bold">
                              Save Rs.{" "}
                              {formData.flashDiscountType === "percentage"
                                ? Math.round(getSelectedPrice() * (formData.flashDiscountValue / 100))
                                : formData.flashDiscountValue}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <FaClock className="inline mr-2" />
                          Start Time *
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.flashStartTime}
                          onChange={(e) => setFormData({ ...formData, flashStartTime: e.target.value })}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <FaClock className="inline mr-2" />
                          End Time *
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.flashEndTime}
                          onChange={(e) => setFormData({ ...formData, flashEndTime: e.target.value })}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                        />
                      </div>
                    </div>

                    {/* Flash Stock */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <FaBox className="inline mr-2" />
                        Flash Stock * (Max: {getSelectedStock()})
                      </label>
                      <input
                        type="number"
                        value={formData.flashStock}
                        onChange={(e) => setFormData({ ...formData, flashStock: Math.min(Number(e.target.value), getSelectedStock()) })}
                        min="1"
                        max={getSelectedStock()}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                        placeholder="Enter flash sale stock quantity"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Limited stock available for flash sale (remaining stock: {getSelectedStock() - formData.flashStock})
                      </p>
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedProduct}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    <FaFire />
                    Create Flash Sale
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFlashSales;
