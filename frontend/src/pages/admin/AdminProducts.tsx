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
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Package,
  DollarSign,
  Tag,
  Palette,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  variants?: Variant[];
  isActive?: boolean;
}

interface Variant {
  _id: string;
  color: string;
  size?: string;
  sku?: string;
  price?: number;
  stock: number;
  images: string[];
  isActive: boolean;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });
  const [variantData, setVariantData] = useState({
    color: "",
    size: "",
    price: "",
    stock: "",
  });
  const [images, setImages] = useState<FileList | null>(null);
  const [variantImages, setVariantImages] = useState<FileList | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products?adminOnly=true"),
        api.get("/categories?adminOnly=true"),
      ]);
      console.log("Products fetched:", productsRes.data.length);
      console.log("Sample product:", productsRes.data[0]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data.filter((c: any) => c.isActive));
    } catch (err) {
      console.error("Fetch error:", err);
      error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      
      console.log("=== FORM SUBMISSION DEBUG ===");
      console.log("Form data:", formData);
      console.log("Images state:", images);
      console.log("Images length:", images?.length || 0);
      
      if (images && images.length > 0) {
        Array.from(images).forEach((img, index) => {
          console.log(`Adding image ${index + 1}:`, img.name, img.size, "bytes");
          data.append("images", img);
        });
        console.log("✅ Uploading images:", images.length);
      } else {
        console.error("❌ No images selected!");
        alert("Please select at least one image!");
        return; // Don't submit without images
      }

      console.log("Submitting to:", editingId ? `PUT /products/${editingId}` : "POST /products");

      // Don't set Content-Type - let browser set it automatically for FormData with boundary
      const config = {
        headers: {
          'Content-Type': undefined, // This allows browser to set multipart/form-data with boundary
        },
      };

      if (editingId) {
        const response = await api.put(`/products/${editingId}`, data, config);
        console.log("Update response:", response.data);
        success("Product updated");
      } else {
        const response = await api.post("/products", data, config);
        console.log("Create response:", response.data);
        success("Product created");
      }
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error("=== SUBMIT ERROR ===");
      console.error("Error:", err);
      console.error("Response:", err.response);
      console.error("Response data:", err.response?.data);
      console.error("Status:", err.response?.status);
      error(err.response?.data?.message || err.message || "Operation failed");
    }
  };

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const data = new FormData();
      data.append("color", variantData.color);
      if (variantData.size) data.append("size", variantData.size);
      if (variantData.price) data.append("price", variantData.price);
      data.append("stock", variantData.stock);
      if (variantImages) {
        Array.from(variantImages).forEach((img) => data.append("images", img));
      }

      await api.post(`/variants/${selectedProduct._id}`, data);
      success("Variant added successfully");
      setVariantData({ color: "", size: "", price: "", stock: "" });
      setVariantImages(null);
      setShowVariantForm(false);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add variant");
    }
  };

  const handleDeleteVariant = async (productId: string, variantId: string) => {
    if (!confirm("Delete this variant?")) return;
    try {
      await api.delete(`/variants/${productId}/${variantId}`);
      success("Variant deleted");
      fetchData();
    } catch (err) {
      error("Failed to delete variant");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    setFormData({ title: "", description: "", price: "", category: "", stock: "" });
    setImages(null);
    setEditingId(null);
    setShowForm(false);
  };

  const filteredProducts = products
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return 0; // Keep original order (newest first from API)
        case "oldest":
          return 0; // Reverse will be applied below
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "stock-asc":
          return a.stock - b.stock;
        case "stock-desc":
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

  // Reverse for oldest
  if (sortBy === "oldest") {
    filteredProducts.reverse();
  }

  if (loading) return <Loading message="Loading products..." variant="product" />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-500 mt-1">{products.length} total products</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel" : "Add Product"}
        </Button>
      </div>

      {/* Product Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Product" : "New Product"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <Label>Category *</Label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Price (Rs.) *</Label>
                  <Input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Stock *</Label>
                  <Input
                    required
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                  rows={4}
                />
              </div>
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
                <Label className="text-lg font-bold text-blue-600">Product Images * (REQUIRED)</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  ⚠️ You MUST upload at least one image for the product
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    setImages(e.target.files);
                    console.log("Images selected:", e.target.files?.length || 0);
                  }}
                  className="cursor-pointer border-2 border-blue-400"
                  required={!editingId}
                />
                {images && images.length > 0 ? (
                  <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/20 rounded border border-green-400">
                    <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                      ✅ {images.length} image(s) selected
                    </p>
                    <ul className="text-xs text-green-600 dark:text-green-500 mt-1">
                      {Array.from(images).map((img, i) => (
                        <li key={i}>• {img.name} ({(img.size / 1024).toFixed(1)} KB)</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900/20 rounded border border-orange-400">
                    <p className="text-sm text-orange-700 dark:text-orange-400 font-semibold">
                      ⚠️ No images selected - Please select at least one image!
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Variant Form Modal */}
      {showVariantForm && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Variant - {selectedProduct.title}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowVariantForm(false);
                    setSelectedProduct(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVariantSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Color *</Label>
                    <Input
                      required
                      value={variantData.color}
                      onChange={(e) => setVariantData({ ...variantData, color: e.target.value })}
                      placeholder="Red, Blue, Black..."
                    />
                  </div>
                  <div>
                    <Label>Size</Label>
                    <Input
                      value={variantData.size}
                      onChange={(e) => setVariantData({ ...variantData, size: e.target.value })}
                      placeholder="S, M, L, XL..."
                    />
                  </div>
                  <div>
                    <Label>Price (Optional)</Label>
                    <Input
                      type="number"
                      value={variantData.price}
                      onChange={(e) => setVariantData({ ...variantData, price: e.target.value })}
                      placeholder="Leave empty to use product price"
                    />
                  </div>
                  <div>
                    <Label>Stock *</Label>
                    <Input
                      required
                      type="number"
                      value={variantData.stock}
                      onChange={(e) => setVariantData({ ...variantData, stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label>Variant Images</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setVariantImages(e.target.files)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Variant</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowVariantForm(false);
                      setSelectedProduct(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-10"
          />
        </div>
        
        {/* Sort Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-colors min-w-[180px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="stock-asc">Stock (Low to High)</option>
              <option value="stock-desc">Stock (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
              {product.images && product.images.length > 0 && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log("Image failed to load:", product.images[0]);
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span class="text-xs">No Image</span>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <Package className="w-12 h-12 mb-2" />
                  <span className="text-xs">No Image</span>
                </div>
              )}
              {product.isActive === false && (
                <Badge variant="danger" className="absolute top-2 right-2">
                  Inactive
                </Badge>
              )}
              {product.variants && product.variants.length > 0 && (
                <Badge className="absolute top-2 left-2 bg-blue-600">
                  <Palette className="w-3 h-3 mr-1" />
                  {product.variants.length} variants
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-bold text-green-600">Rs. {product.price}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Package className="w-4 h-4" />
                  <span>Stock: {product.stock}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Tag className="w-4 h-4" />
                  <span className="truncate">{product.category}</span>
                </div>
              </div>

              {/* Variants Display */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs font-semibold mb-2">Variants:</p>
                  <div className="space-y-1">
                    {product.variants.slice(0, 3).map((variant) => (
                      <div
                        key={variant._id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="flex items-center gap-1">
                          <Palette className="w-3 h-3" />
                          {variant.color} {variant.size && `- ${variant.size}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Stock: {variant.stock}</span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteVariant(product._id, variant._id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {product.variants.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{product.variants.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(product)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowVariantForm(true);
                  }}
                  className="flex-1"
                  title="Add Variant"
                >
                  <Palette className="w-4 h-4" />
                </Button>
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
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
