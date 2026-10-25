import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Loading } from "../../components/ui/loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Package,
  DollarSign,
  Tag,
  Image as ImageIcon,
  BarChart3,
} from "lucide-react";

// Predefined colors matching backend
const PREDEFINED_COLORS = [
  { name: "Black", code: "#000000" },
  { name: "White", code: "#FFFFFF" },
  { name: "Red", code: "#FF0000" },
  { name: "Blue", code: "#0000FF" },
  { name: "Green", code: "#00FF00" },
  { name: "Yellow", code: "#FFFF00" },
  { name: "Orange", code: "#FFA500" },
  { name: "Purple", code: "#800080" },
  { name: "Pink", code: "#FFC0CB" },
  { name: "Brown", code: "#A52A2A" },
  { name: "Gray", code: "#808080" },
  { name: "Navy", code: "#000080" },
];

interface ColorVariant {
  _id?: string;
  colorName: string;
  colorCode: string;
  images: string[];
  sku?: string;
  price?: number;
  stock: number;
  isActive: boolean;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  brand?: string;
  stock: number;
  sku?: string;
  isActive: boolean;
  colorVariants?: ColorVariant[];
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 3x3 grid
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: "",
    category: "",
    brand: "",
    stock: "",
    sku: "",
    isActive: true,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [variants, setVariants] = useState<ColorVariant[]>([]);
  const [variantForm, setVariantForm] = useState({
    colorName: "",
    colorCode: "",
    sku: "",
    price: "",
    stock: "",
    isActive: true,
  });
  const [variantImages, setVariantImages] = useState<File[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [selectedProductStats, setSelectedProductStats] = useState<any>(null);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories?adminOnly=true"),
        api.get("/brands"),
      ]);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.products ?? []));
      setCategories(categoriesRes.data.filter((c: any) => c.isActive));
      setBrands(brandsRes.data.filter((b: any) => b.isActive));
    } catch (err) {
      error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return; // Prevent double submission
    
    // Validate discount
    if (formData.discount) {
      const discountValue = parseFloat(formData.discount);
      if (discountValue < 0 || discountValue > 100) {
        error("Discount must be between 0 and 100%");
        return;
      }
    }
    
    try {
      setSubmitting(true);
      const data = new FormData();
      
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("stock", formData.stock);
      data.append("isActive", formData.isActive.toString());
      
      if (formData.originalPrice) data.append("originalPrice", formData.originalPrice);
      if (formData.discount) data.append("discount", formData.discount);
      if (formData.brand) data.append("brand", formData.brand);
      if (formData.sku) data.append("sku", formData.sku);
      
      imageFiles.forEach((file) => {
        data.append("images", file);
      });

      if (editingId) {
        await api.put(`/products/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        success("Product updated");
      } else {
        const response = await api.post("/products", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        // Upload variant images if product was created successfully
        if (response.data._id && variants.length > 0) {
          for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];
            if (variant.images && variant.images.length > 0) {
              const variantData = new FormData();
              variantData.append("colorName", variant.colorName);
              variantData.append("colorCode", variant.colorCode);
              variantData.append("stock", variant.stock.toString());
              if (variant.sku) variantData.append("sku", variant.sku);
              if (variant.price) variantData.append("price", variant.price.toString());
              variantData.append("isActive", variant.isActive.toString());
              
              // Add variant images
              variant.images.forEach((img: any) => {
                if (img instanceof File) {
                  variantData.append("images", img);
                }
              });
              
              try {
                await api.post(`/variants/${response.data._id}`, variantData, {
                  headers: { "Content-Type": "multipart/form-data" },
                });
              } catch (variantErr: any) {
                console.error("Failed to upload variant:", variantErr);
                error(`Failed to upload variant: ${variant.colorName}`);
              }
            }
          }
        }
        
        success(variants.length > 0 ? "Product created with variants" : "Product created");
      }
      resetForm();
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      discount: product.discount?.toString() || "",
      category: product.category,
      brand: product.brand || "",
      stock: product.stock.toString(),
      sku: product.sku || "",
      isActive: product.isActive,
    });
    setVariants(product.colorVariants || []);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      success("Product deleted");
      fetchData();
    } catch (err) {
      error("Failed to delete");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      originalPrice: "",
      discount: "",
      category: "",
      brand: "",
      stock: "",
      sku: "",
      isActive: true,
    });
    setImageFiles([]);
    setVariants([]);
    setVariantForm({
      colorName: "",
      colorCode: "",
      sku: "",
      price: "",
      stock: "",
      isActive: true,
    });
    setVariantImages([]);
    setShowVariantForm(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddVariant = () => {
    if (!variantForm.colorName || !variantForm.colorCode || variantImages.length === 0) {
      error("Color name, color code, and at least 1 image are required");
      return;
    }
    
    if (variantImages.length > 4) {
      error("Maximum 4 images per variant");
      return;
    }

    const newVariant: ColorVariant = {
      colorName: variantForm.colorName,
      colorCode: variantForm.colorCode,
      images: variantImages as any,
      sku: variantForm.sku,
      price: variantForm.price ? parseFloat(variantForm.price) : undefined,
      stock: parseInt(variantForm.stock) || 0,
      isActive: variantForm.isActive,
    };

    setVariants([...variants, newVariant]);
    setVariantForm({
      colorName: "",
      colorCode: "",
      sku: "",
      price: "",
      stock: "",
      isActive: true,
    });
    setVariantImages([]);
    setShowVariantForm(false);
    success("Variant added");
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleViewStats = async (productId: string) => {
    try {
      const { data } = await api.get(`/variant-stats/${productId}`);
      setSelectedProductStats(data);
      setShowStatsDialog(true);
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to fetch stats");
    }
  };
  const safeProducts = Array.isArray(products) ? products : [];

  const filteredProducts = safeProducts.filter((products) =>
    products.title.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  if (loading) return <Loading message="Loading products..." fullScreen={true} />;

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 h-full dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-900 dark:text-gray-200 mt-1">{products.length} total products</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel" : "Add Product"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Product" : "New Product"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Title *</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Product name"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description *</Label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Price *</Label>
                  <Input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="999"
                  />
                </div>
                <div>
                  <Label>Original Price</Label>
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="1299"
                  />
                </div>
                <div>
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                        setFormData({ ...formData, discount: value });
                      }
                    }}
                    placeholder="20"
                  />
                </div>
                <div>
                  <Label>Stock *</Label>
                  <Input
                    required
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label>Category *</Label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
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
                  <Label>Brand</Label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand.name}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="PROD-001"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Images</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                  />
                  {imageFiles.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">{imageFiles.length} file(s) selected</p>
                  )}
                </div>
              </div>
              
              {/* Color Variants Section */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-lg">Color Variants ({variants.length})</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowVariantForm(!showVariantForm)}
                  >
                    {showVariantForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {showVariantForm ? "Cancel" : "Add Variant"}
                  </Button>
                </div>

                {/* Variant Form */}
                {showVariantForm && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Color Picker Only */}
                      <div className="md:col-span-2">
                        <Label>Color *</Label>
                        <div className="flex gap-3 items-start">
                          {/* Color Name Input */}
                          <div className="flex-1">
                            <Input
                              type="text"
                              value={variantForm.colorName}
                              onChange={(e) => setVariantForm({ ...variantForm, colorName: e.target.value })}
                              placeholder="Enter color name (e.g., Red, Sky Blue)"
                              className="w-full"
                            />
                          </div>
                          
                          {/* Color Picker */}
                          <div className="flex flex-col items-center gap-1">
                            <input
                              type="color"
                              value={variantForm.colorCode || "#000000"}
                              onChange={(e) => setVariantForm({ ...variantForm, colorCode: e.target.value })}
                              className="w-20 h-10 rounded border cursor-pointer"
                              title="Pick color"
                            />
                            <span className="text-xs text-gray-500">Pick Color</span>
                          </div>
                        </div>
                        
                        {/* Color Preview */}
                        {variantForm.colorName && variantForm.colorCode && (
                          <div className="flex items-center gap-3 mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg border">
                            <div
                              className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                              style={{ backgroundColor: variantForm.colorCode }}
                            />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {variantForm.colorName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {variantForm.colorCode}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Variant SKU</Label>
                        <Input
                          value={variantForm.sku}
                          onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                          placeholder="PROD-RED-001"
                        />
                      </div>
                      <div>
                        <Label>Variant Price (optional)</Label>
                        <Input
                          type="number"
                          value={variantForm.price}
                          onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                          placeholder="Override product price"
                        />
                      </div>
                      <div>
                        <Label>Stock *</Label>
                        <Input
                          type="number"
                          value={variantForm.stock}
                          onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
                          placeholder="10"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Variant Images * (1-4 images)</Label>
                        <Input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 4) {
                              error("Maximum 4 images per variant");
                              return;
                            }
                            setVariantImages(files);
                          }}
                        />
                        {variantImages.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-2">{variantImages.length} file(s) selected</p>
                            <div className="grid grid-cols-4 gap-2">
                              {variantImages.map((file, idx) => (
                                <div key={idx} className="relative">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${idx + 1}`}
                                    className="w-full h-20 object-cover rounded border"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="variantActive"
                        checked={variantForm.isActive}
                        onChange={(e) => setVariantForm({ ...variantForm, isActive: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="variantActive">Active</Label>
                    </div>
                    <Button type="button" size="sm" onClick={handleAddVariant}>
                      Add Variant
                    </Button>
                  </div>
                )}

                {/* Variants List */}
                {variants.length > 0 && (
                  <div className="space-y-2">
                    {variants.map((variant, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: variant.colorCode }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{variant.colorName}</p>
                          <p className="text-sm text-gray-500">
                            Stock: {variant.stock} | Images: {Array.isArray(variant.images) ? variant.images.length : 0}
                            {variant.price && ` | Price: Rs. ${variant.price}`}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveVariant(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingId ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingId ? "Update" : "Create"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentProducts.map((product) => (
              <Card key={product._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{product.title}</h3>
                      <Badge variant={product.isActive ? "success" : "danger"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-bold text-green-600">Rs. {product.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span>Stock: {product.stock}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span className="truncate">{product.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    {product.colorVariants && product.colorVariants.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewStats(product._id)}
                        title="View variant order statistics"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No products found
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        size="sm"
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
          
          {filteredProducts.length > 0 && (
            <div className="text-center text-sm text-gray-500 mt-4">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Variant Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Variant Order Statistics</DialogTitle>
          </DialogHeader>
          {selectedProductStats && (
            <div className="space-y-4">
              {selectedProductStats.variants && selectedProductStats.variants.length > 0 ? (
                <div className="space-y-3">
                  {selectedProductStats.variants.map((variant: any, index: number) => (
                    <Card key={index} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full border-2"
                              style={{ backgroundColor: variant.colorCode }}
                            />
                            <div>
                              <h3 className="font-bold text-lg">{variant.colorName}</h3>
                              <p className="text-sm text-gray-500">{variant.colorCode}</p>
                            </div>
                          </div>
                          <Badge variant="default" className="text-lg px-4 py-1">
                            {variant.totalQuantity} sold
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mt-3">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Processing</p>
                            <p className="text-xl font-bold text-blue-600">
                              {variant.ordersByStatus?.processing || 0}
                            </p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Shipped</p>
                            <p className="text-xl font-bold text-orange-600">
                              {variant.ordersByStatus?.shipped || 0}
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Delivered</p>
                            <p className="text-xl font-bold text-green-600">
                              {variant.ordersByStatus?.delivered || 0}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                          Total Orders: {variant.totalOrders}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No order data available for variants yet
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
