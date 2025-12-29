import { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/common/Pagination";

interface Product {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  stock: number;
  sku?: string;
  images: string[];
  specifications?: {
    weight?: string;
    dimensions?: string;
    material?: string;
    color?: string;
    size?: string;
  };
  features?: string[];
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  freeShipping?: boolean;
  shippingCost?: number;
  warranty?: string;
  returnPolicy?: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    price: "",
    originalPrice: "",
    discount: "",
    category: "",
    subcategory: "",
    brand: "",
    stock: "",
    sku: "",
    weight: "",
    dimensions: "",
    material: "",
    color: "",
    size: "",
    features: "",
    tags: "",
    isActive: true,
    isFeatured: false,
    freeShipping: false,
    shippingCost: "",
    warranty: "",
    returnPolicy: "",
  });
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { success, error } = useToast();

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage]);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products?adminOnly=true");
      setProducts(data);
    } catch (err: any) {
      error("Failed to fetch products");
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories?adminOnly=true");
      setCategories(data.filter((cat: any) => cat.isActive));
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      shortDescription: product.shortDescription || "",
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      discount: product.discount?.toString() || "",
      category: product.category,
      subcategory: product.subcategory || "",
      brand: product.brand || "",
      stock: product.stock.toString(),
      sku: product.sku || "",
      weight: product.specifications?.weight || "",
      dimensions: product.specifications?.dimensions || "",
      material: product.specifications?.material || "",
      color: product.specifications?.color || "",
      size: product.specifications?.size || "",
      features: product.features?.join(", ") || "",
      tags: product.tags?.join(", ") || "",
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      freeShipping: product.freeShipping ?? false,
      shippingCost: product.shippingCost?.toString() || "",
      warranty: product.warranty || "",
      returnPolicy: product.returnPolicy || "",
    });
    setShowForm(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete._id}`);
      success("Product deleted successfully!");
      setShowDeleteConfirm(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to delete product");
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const handleAddToFeatured = async (product: Product) => {
    try {
      const featuredData = {
        title: product.title,
        description: product.description,
        price: product.price,
        image: product.images[0] || "",
        category: product.category,
        isActive: true,
        isFeatured: true,
        order: 0,
      };
      await api.post("/featured-products", featuredData);
      success(`"${product.title}" added to Featured Products!`);
    } catch (err: any) {
      error(
        err.response?.data?.message || "Failed to add to featured products"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("stock", formData.stock);

      if (formData.shortDescription)
        formDataToSend.append("shortDescription", formData.shortDescription);
      if (formData.originalPrice)
        formDataToSend.append("originalPrice", formData.originalPrice);
      if (formData.discount)
        formDataToSend.append("discount", formData.discount);
      if (formData.subcategory)
        formDataToSend.append("subcategory", formData.subcategory);
      if (formData.brand) formDataToSend.append("brand", formData.brand);
      if (formData.sku) formDataToSend.append("sku", formData.sku);

      const specifications = {
        weight: formData.weight,
        dimensions: formData.dimensions,
        material: formData.material,
        color: formData.color,
        size: formData.size,
      };
      formDataToSend.append("specifications", JSON.stringify(specifications));

      if (formData.features) {
        const featuresArray = formData.features
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f);
        formDataToSend.append("features", JSON.stringify(featuresArray));
      }
      if (formData.tags) {
        const tagsArray = formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t);
        formDataToSend.append("tags", JSON.stringify(tagsArray));
      }

      formDataToSend.append("isActive", String(formData.isActive));
      formDataToSend.append("isFeatured", String(formData.isFeatured));
      formDataToSend.append("freeShipping", String(formData.freeShipping));

      if (formData.shippingCost)
        formDataToSend.append("shippingCost", formData.shippingCost);
      if (formData.warranty)
        formDataToSend.append("warranty", formData.warranty);
      if (formData.returnPolicy)
        formDataToSend.append("returnPolicy", formData.returnPolicy);

      if (images && images.length > 0) {
        Array.from(images).forEach((image) => {
          formDataToSend.append("images", image);
        });
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        success("Product updated successfully!");
      } else {
        await api.post("/products", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        success("Product created successfully!");
      }

      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      setImages(null);
      fetchProducts();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      shortDescription: "",
      price: "",
      originalPrice: "",
      discount: "",
      category: "",
      subcategory: "",
      brand: "",
      stock: "",
      sku: "",
      weight: "",
      dimensions: "",
      material: "",
      color: "",
      size: "",
      features: "",
      tags: "",
      isActive: true,
      isFeatured: false,
      freeShipping: false,
      shippingCost: "",
      warranty: "",
      returnPolicy: "",
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    resetForm();
    setImages(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold mb-2 flex items-center gap-2 md:gap-3">
              <svg
                className="w-6 h-6 md:w-10 md:h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              Products Management
            </h2>
            <p className="text-white/90 text-sm md:text-lg">
              {products.length} product{products.length !== 1 ? "s" : ""} in
              inventory
            </p>
          </div>
          <button
            onClick={() => (showForm ? handleCancel() : setShowForm(true))}
            className="px-4 py-2 md:px-6 md:py-3 bg-white text-blue-600 rounded-lg md:rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg font-semibold flex items-center gap-2 transform hover:scale-105 text-sm md:text-base"
          >
            {showForm ? (
              <>
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </>
            ) : (
              <>
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
                Add New Product
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-gray-200 dark:border-gray-700"
        >
          {/* Form Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      editingProduct
                        ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        : "M12 4v16m8-8H4"
                    }
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingProduct ? "Edit Product" : "Create New Product"}
                </h3>
                {editingProduct && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Updating: {editingProduct.title}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Basic Info Section */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                  1
                </span>
                Basic Information
              </h4>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Modern Leather Sofa"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="Brief product summary..."
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortDescription: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Full Description *
                </label>
                <textarea
                  placeholder="Detailed product description..."
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  rows={4}
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <h4 className="text-sm font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                  2
                </span>
                Pricing & Stock
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Original Price
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originalPrice: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Discount %
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Category Section */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <h4 className="text-sm font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">
                  3
                </span>
                Category & Brand
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Living Room"
                    value={formData.subcategory}
                    onChange={(e) =>
                      setFormData({ ...formData, subcategory: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., IKEA"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mt-6 p-6 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 hover:border-blue-500 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white">
                  {editingProduct ? "Add More Images" : "Upload Product Images"}
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  PNG, JPG up to 5MB each
                </p>
              </div>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages(e.target.files)}
              className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-600 file:text-white hover:file:from-blue-600 hover:file:to-indigo-700 file:cursor-pointer file:shadow-lg file:transition-all file:duration-200"
            />
            {images && images.length > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                ✓ {images.length} new image(s) selected
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg transform hover:scale-[1.02] font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {editingProduct ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
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
                      d={editingProduct ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"}
                    />
                  </svg>
                  {editingProduct ? "Update Product" : "Create Product"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold flex items-center justify-center gap-2"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No products yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Click "Add Product" to create your first product
            </p>
          </div>
        ) : (
          paginatedProducts.map((product) => (
            <div
              key={product._id}
              className={`bg-white dark:bg-gray-800 rounded-lg md:rounded-xl p-1.5 md:p-3 shadow border transition-all duration-300 ${
                editingProduct?._id === product._id
                  ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900/50"
                  : "border-gray-200 dark:border-gray-700 hover:shadow-md"
              }`}
            >
              {/* Image */}
              <div className="relative mb-1.5 md:mb-3">
                <img
                  src={product.images?.[0] || "/placeholder.jpg"}
                  alt={product.title}
                  className="w-full h-24 md:h-40 object-cover rounded-lg md:rounded-xl"
                />
                {product.images.length > 1 && (
                  <span className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/70 text-white text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                    +{product.images.length - 1}
                  </span>
                )}
                {product.stock < 10 && (
                  <span className="absolute top-1 left-1 md:top-2 md:left-2 bg-red-500 text-white text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full font-semibold">
                    Low
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-1 md:space-y-2">
                <h3 className="font-bold text-xs md:text-lg text-gray-900 dark:text-white line-clamp-1 md:line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-400 line-clamp-1 md:line-clamp-2 hidden md:block">
                  {product.description}
                </p>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-1 md:pt-2 gap-1">
                  <p className="text-sm md:text-2xl font-bold text-[var(--root-color)]">
                    Rs. {product.price.toLocaleString()}
                  </p>
                  <span className="px-2 py-0.5 md:px-3 md:py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-[10px] md:text-sm font-medium w-fit">
                    Stock: {product.stock}
                  </span>
                </div>
                <div className="pt-1 md:pt-2">
                  <span className="inline-block px-2 py-0.5 md:px-3 md:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-[10px] md:text-xs font-medium">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1 md:gap-2 mt-2 md:mt-4 pt-2 md:pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-1 md:gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-blue-500 text-white px-2 py-1.5 md:px-3 md:py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-1 md:gap-2 text-xs md:text-base"
                  >
                    <svg
                      className="w-3 h-3 md:w-4 md:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(product)}
                    className="flex-1 bg-red-500 text-white px-2 py-1.5 md:px-3 md:py-2 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-1 md:gap-2 text-xs md:text-base"
                  >
                    <svg
                      className="w-3 h-3 md:w-4 md:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
                <button
                  onClick={() => handleAddToFeatured(product)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-2 py-1.5 md:px-3 md:py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-colors font-medium flex items-center justify-center gap-1 md:gap-2 text-xs md:text-base"
                >
                  <svg
                    className="w-3 h-3 md:w-4 md:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Add to</span> Featured
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {products.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={products.length}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Product"
        message={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.title}"? This action cannot be undone.`
            : ""
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default AdminProducts;
