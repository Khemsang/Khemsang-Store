import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { useMinimumLoading } from "../../hooks/useMinimumLoading";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Loading } from "../../components/ui/loading";
import { Plus, Edit, Trash2, X, FolderOpen, Lock } from "lucide-react";
import {
  FaCouch,
  FaChair,
  FaBed,
  FaDoorOpen,
  FaBox,
  FaLightbulb,
  FaTv,
  FaUtensils,
  FaBath,
  FaWarehouse,
  FaHome,
  FaPalette,
  FaTools,
  FaTshirt,
  FaShoePrints,
  FaGlasses,
  FaHatCowboy,
  FaGem,
  FaMobileAlt,
  FaLaptop,
  FaHeadphones,
  FaCamera,
  FaGamepad,
  FaBook,
  FaMusic,
  FaDumbbell,
  FaBicycle,
  FaFootballBall,
  FaBaby,
  FaPaw,
  FaLeaf,
  FaCoffee,
  FaWineGlass,
  FaBirthdayCake,
  FaGift,
  FaUmbrella,
  FaSuitcase,
  FaCar,
  FaPlane,
  FaPaintBrush,
} from "react-icons/fa";

interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

// Available icons for categories
const availableIcons = [
  { name: "FaCouch", icon: FaCouch, label: "Couch" },
  { name: "FaChair", icon: FaChair, label: "Chair" },
  { name: "FaBed", icon: FaBed, label: "Bed" },
  { name: "FaDoorOpen", icon: FaDoorOpen, label: "Door" },
  { name: "FaLightbulb", icon: FaLightbulb, label: "Light" },
  { name: "FaTv", icon: FaTv, label: "TV" },
  { name: "FaUtensils", icon: FaUtensils, label: "Utensils" },
  { name: "FaBath", icon: FaBath, label: "Bath" },
  { name: "FaWarehouse", icon: FaWarehouse, label: "Warehouse" },
  { name: "FaHome", icon: FaHome, label: "Home" },
  { name: "FaPalette", icon: FaPalette, label: "Palette" },
  { name: "FaTools", icon: FaTools, label: "Tools" },
  { name: "FaBox", icon: FaBox, label: "Box" },
  { name: "FaTshirt", icon: FaTshirt, label: "Shirt" },
  { name: "FaShoePrints", icon: FaShoePrints, label: "Shoes" },
  { name: "FaGlasses", icon: FaGlasses, label: "Glasses" },
  { name: "FaHatCowboy", icon: FaHatCowboy, label: "Hat" },
  { name: "FaGem", icon: FaGem, label: "Gem" },
  { name: "FaMobileAlt", icon: FaMobileAlt, label: "Mobile" },
  { name: "FaLaptop", icon: FaLaptop, label: "Laptop" },
  { name: "FaHeadphones", icon: FaHeadphones, label: "Headphones" },
  { name: "FaCamera", icon: FaCamera, label: "Camera" },
  { name: "FaGamepad", icon: FaGamepad, label: "Gamepad" },
  { name: "FaBook", icon: FaBook, label: "Book" },
  { name: "FaMusic", icon: FaMusic, label: "Music" },
  { name: "FaDumbbell", icon: FaDumbbell, label: "Dumbbell" },
  { name: "FaBicycle", icon: FaBicycle, label: "Bicycle" },
  { name: "FaFootballBall", icon: FaFootballBall, label: "Football" },
  { name: "FaBaby", icon: FaBaby, label: "Baby" },
  { name: "FaPaw", icon: FaPaw, label: "Pet" },
  { name: "FaLeaf", icon: FaLeaf, label: "Leaf" },
  { name: "FaCoffee", icon: FaCoffee, label: "Coffee" },
  { name: "FaWineGlass", icon: FaWineGlass, label: "Wine" },
  { name: "FaBirthdayCake", icon: FaBirthdayCake, label: "Cake" },
  { name: "FaGift", icon: FaGift, label: "Gift" },
  { name: "FaUmbrella", icon: FaUmbrella, label: "Umbrella" },
  { name: "FaSuitcase", icon: FaSuitcase, label: "Suitcase" },
  { name: "FaCar", icon: FaCar, label: "Car" },
  { name: "FaPlane", icon: FaPlane, label: "Plane" },
  { name: "FaPaintBrush", icon: FaPaintBrush, label: "Paint" },
];

// Helper to get icon component
const getIconComponent = (iconName?: string) => {
  const iconObj = availableIcons.find((i) => i.name === iconName);
  return iconObj ? iconObj.icon : FaBox;
};

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumLoading(loading, 1000);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "FaBox",
    image: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { success, error } = useToast();
  const { user } = useAuth();
  
  // Check if user is super admin
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
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("icon", formData.icon);
      submitData.append("isActive", String(formData.isActive));
      
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      if (editingId) {
        await api.put(`/categories/${editingId}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        success("Category updated");
      } else {
        await api.post("/categories", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
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
      icon: category.icon || "FaBox",
      image: (category as any).image || "",
      isActive: category.isActive,
    });
    setImagePreview((category as any).image || "");
    setImageFile(null);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    setFormData({ name: "", description: "", icon: "FaBox", image: "", isActive: true });
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
    setShowForm(false);
  };

  if (showLoading) return <Loading message="Loading categories..." fullScreen={true} />;

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Categories</h1>
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

              {/* Image Upload */}
              <div>
                <Label>Category Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Upload an image for this category
                </p>
              </div>
              
              {/* Icon Selector */}
              <div>
                <Label className="mb-3 block">Select Icon *</Label>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  {availableIcons.map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <button
                        key={iconOption.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconOption.name })}
                        className={`p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                          formData.icon === iconOption.name
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-lg"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
                        }`}
                        title={iconOption.label}
                      >
                        <IconComponent className={`text-2xl ${
                          formData.icon === iconOption.name
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`} />
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {availableIcons.find(i => i.name === formData.icon)?.label || "Box"}
                </p>
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
        {categories.map((category) => {
          const IconComponent = getIconComponent(category.icon);
          return (
            <Card key={category._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
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
          );
        })}
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
