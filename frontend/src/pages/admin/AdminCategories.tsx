import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Loading } from "../../components/ui/loading";
import { Plus, Edit, Trash2, X, FolderOpen, Lock } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const { success, error } = useToast();
  
  // Get user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  const isSuperAdmin = user?.isSuperAdmin || false;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/categories?adminOnly=true");
      setCategories(data);
    } catch (err) {
      error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
        success("Category updated");
      } else {
        await api.post("/categories", formData);
        success("Category created");
      }
      resetForm();
      fetchCategories();
    } catch (err: any) {
      error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      success("Category deleted");
      fetchCategories();
    } catch (err) {
      error("Failed to delete");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <Loading message="Loading categories..." />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-500 mt-1">
            {categories.length} total categories
            {!isSuperAdmin && <span className="ml-2 text-amber-600">(View Only - Super Admin can manage)</span>}
          </p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? "Cancel" : "Add Category"}
          </Button>
        )}
      </div>

      {/* Super Admin Only Notice */}
      {!isSuperAdmin && (
        <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Only Super Admin can create, edit, or delete categories. You can view and use existing categories for products.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      {showForm && isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Category" : "New Category"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Category name"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <Badge variant={category.isActive ? "success" : "danger"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {category.description}
                </p>
              )}
              {isSuperAdmin && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(category)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(category._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No categories found</p>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
