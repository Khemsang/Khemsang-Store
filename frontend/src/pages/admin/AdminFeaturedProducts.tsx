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
import { Pagination } from "../../components/ui/pagination";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Star,
  DollarSign,
  Tag,
  TrendingUp,
} from "lucide-react";

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
  order: number;
}

const AdminFeaturedProducts = () => {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: "",
    category: "",
    productId: "",
    order: "0",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, allProductsRes] = await Promise.all([
        api.get("/featured-products"),
        api.get("/categories?adminOnly=true"),
        api.get("/products"),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data.filter((c: any) => c.isActive));
      const rawProducts = allProductsRes.data;
      setAllProducts(Array.isArray(rawProducts) ? rawProducts : (rawProducts.products ?? []));
    } catch (err) {
      error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("order", formData.order);
      data.append("isActive", formData.isActive.toString());
      

      if (formData.productId) {
        data.append("productId", formData.productId);
      }
      
      if (formData.originalPrice) data.append("originalPrice", formData.originalPrice);
      if (formData.discount) data.append("discount", formData.discount);
      

      if (imageFile) {
        data.append("image", imageFile);
      }

      if (editingId) {
        await api.put(`/featured-products/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        success("Featured product updated");
      } else {
        await api.post("/featured-products", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        success("Featured product created");
      }
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error("Submit error:", err);
      error(err.response?.data?.message || err.response?.data?.error || "Operation failed");
    }
  };

  const handleEdit = (product: FeaturedProduct) => {
    setEditingId(product._id);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      discount: product.discount?.toString() || "",
      category: product.category,
      productId: product.productId || "",
      order: product.order.toString(),
      isActive: product.isActive,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this featured product?")) return;
    try {
      await api.delete(`/featured-products/${id}`);
      success("Featured product deleted");
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
      productId: "",
      order: "0",
      isActive: true,
    });
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );


  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);


  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  if (loading) return <Loading message="Loading featured products..." fullScreen={true} />;

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900 h-full">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Featured Products</h1>
          <p className="text-gray-500 mt-1">{products.length} featured products</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel" : "Add Featured"}
        </Button>
      </div>

      
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Featured Product" : "New Featured Product"}</CardTitle>
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
                  <Label>Link to Product * (Required for purchasing)</Label>
                  <select
                    required
                    value={formData.productId}
                    onChange={(e) => {
                      const selectedProd = allProducts.find(p => p._id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        productId: e.target.value,

                        price: formData.price || selectedProd?.price || '',

                        category: formData.category || selectedProd?.category || ''
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="">Select a product to link</option>
                    {allProducts.map((prod) => (
                      <option key={prod._id} value={prod._id}>
                        {prod.title} - Rs. {prod.price}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ Required: Link this featured product to an actual product for cart functionality and proper display
                  </p>
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
                  <Label>Original Price</Label>
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
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
              <div>
                <Label>Image *</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  required={!editingId}
                />
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
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search featured products..."
            className="pl-10"
          />
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {currentProducts.map((product) => (
          <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <svg class="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <Star className="w-10 h-10 mb-1" />
                  <span className="text-xs">No Image</span>
                </div>
              )}
              <Badge className="absolute top-1.5 left-1.5 text-xs bg-gradient-to-r from-orange-500 to-amber-600">
                <Star className="w-2.5 h-2.5 mr-1" />
                Featured
              </Badge>
              {product.isActive === false && (
                <Badge variant="danger" className="absolute top-1.5 right-1.5 text-xs">
                  Inactive
                </Badge>
              )}
              {product.discount && product.discount > 0 && (
                <Badge className="absolute bottom-1.5 right-1.5 text-xs bg-green-600">
                  -{product.discount}%
                </Badge>
              )}
            </div>
            <CardContent className="p-3">
              <h3 className="font-semibold text-sm mb-1.5 line-clamp-2">{product.title}</h3>
              <div className="space-y-1 text-xs mb-3">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-green-600">Rs. {product.price}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through text-xs">
                        Rs. {product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <Tag className="w-3.5 h-3.5" />
                  <span className="truncate">{product.category}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Order: {product.order}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(product)}
                  className="flex-1 h-8 px-2"
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(product._id)}
                  className="flex-1 h-8 px-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No featured products found</p>
        </div>
      )}

      
      {filteredProducts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}
    </div>
  );
};

export default AdminFeaturedProducts;
