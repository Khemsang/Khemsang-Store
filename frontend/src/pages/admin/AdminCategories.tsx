import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Pagination } from "../../components/common";
import {
  FaPlus,
  FaEdit,
  FaTrash,
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
  description: string;
  icon: string;
  image: string;
  isActive: boolean;
}

// Available icons for categories
const availableIcons = [
  // Furniture
  { name: "FaCouch", icon: FaCouch, label: "Sofa" },
  { name: "FaChair", icon: FaChair, label: "Chair" },
  { name: "FaBed", icon: FaBed, label: "Bed" },
  { name: "FaDoorOpen", icon: FaDoorOpen, label: "Cabinet" },
  { name: "FaBox", icon: FaBox, label: "Table" },

  // Clothing & Fashion
  { name: "FaTshirt", icon: FaTshirt, label: "Clothing" },
  { name: "FaShoePrints", icon: FaShoePrints, label: "Shoes" },
  { name: "FaGlasses", icon: FaGlasses, label: "Eyewear" },
  { name: "FaHatCowboy", icon: FaHatCowboy, label: "Hats" },

  // Jewelry & Accessories
  { name: "FaGem", icon: FaGem, label: "Jewelry" },
  { name: "FaUmbrella", icon: FaUmbrella, label: "Accessories" },
  { name: "FaSuitcase", icon: FaSuitcase, label: "Bags" },

  // Electronics
  { name: "FaTv", icon: FaTv, label: "TV" },
  { name: "FaMobileAlt", icon: FaMobileAlt, label: "Mobile" },
  { name: "FaLaptop", icon: FaLaptop, label: "Laptop" },
  { name: "FaHeadphones", icon: FaHeadphones, label: "Audio" },
  { name: "FaCamera", icon: FaCamera, label: "Camera" },
  { name: "FaGamepad", icon: FaGamepad, label: "Gaming" },

  // Home & Living
  { name: "FaHome", icon: FaHome, label: "Home" },
  { name: "FaLightbulb", icon: FaLightbulb, label: "Lighting" },
  { name: "FaUtensils", icon: FaUtensils, label: "Kitchen" },
  { name: "FaBath", icon: FaBath, label: "Bathroom" },
  { name: "FaWarehouse", icon: FaWarehouse, label: "Storage" },
  { name: "FaPalette", icon: FaPalette, label: "Decor" },

  // Food & Beverages
  { name: "FaCoffee", icon: FaCoffee, label: "Coffee" },
  { name: "FaWineGlass", icon: FaWineGlass, label: "Drinks" },
  { name: "FaBirthdayCake", icon: FaBirthdayCake, label: "Bakery" },

  // Sports & Fitness
  { name: "FaDumbbell", icon: FaDumbbell, label: "Fitness" },
  { name: "FaBicycle", icon: FaBicycle, label: "Cycling" },
  { name: "FaFootballBall", icon: FaFootballBall, label: "Sports" },

  // Entertainment & Hobbies
  { name: "FaBook", icon: FaBook, label: "Books" },
  { name: "FaMusic", icon: FaMusic, label: "Music" },
  { name: "FaPaintBrush", icon: FaPaintBrush, label: "Art" },

  // Kids & Pets
  { name: "FaBaby", icon: FaBaby, label: "Baby" },
  { name: "FaPaw", icon: FaPaw, label: "Pets" },

  // Travel & Outdoor
  { name: "FaCar", icon: FaCar, label: "Auto" },
  { name: "FaPlane", icon: FaPlane, label: "Travel" },

  // Others
  { name: "FaGift", icon: FaGift, label: "Gifts" },
  { name: "FaLeaf", icon: FaLeaf, label: "Plants" },
  { name: "FaTools", icon: FaTools, label: "Tools" },
];

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  const iconObj = availableIcons.find((i) => i.name === iconName);
  return iconObj ? iconObj.icon : FaBox;
};

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "FaBox",
    image: "",
    isActive: true,
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { success, error } = useToast();

  // Paginated categories
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return categories.slice(startIndex, endIndex);
  }, [categories, currentPage]);

  const totalPages = Math.ceil(categories.length / itemsPerPage);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // adminOnly=true shows only current admin's categories
      const { data } = await api.get("/categories?adminOnly=true");
      setCategories(data);
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
        success("Category updated successfully");
      } else {
        await api.post("/categories", formData);
        success("Category created successfully");
      }
      fetchCategories();
      handleCloseModal();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      await api.delete(`/categories/${id}`);
      success("Category deleted successfully");
      fetchCategories();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to delete category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon || "FaBox",
      image: category.image || "",
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      icon: "FaBox",
      image: "",
      isActive: true,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      setImageUploading(true);
      const { data } = await api.post("/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData({ ...formData, image: data.url });
      success("Image uploaded successfully");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--root-color)]"></div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Categories Management
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded-lg md:rounded-xl hover:shadow-lg transition-all text-sm md:text-base"
        >
          <FaPlus /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {paginatedCategories.map((category) => {
          const IconComponent = getIconComponent(category.icon);
          return (
            <div
              key={category._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-20 md:h-32 bg-gradient-to-br from-[var(--root-color)] to-purple-600 flex items-center justify-center overflow-hidden">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IconComponent className="text-3xl md:text-6xl text-white opacity-90" />
                )}
                <div
                  className={`absolute top-2 right-2 md:top-3 md:right-3 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold ${
                    category.isActive
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </div>
              </div>
              <div className="p-3 md:p-5">
                <h3 className="text-sm md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2 line-clamp-1">
                  {category.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-2 md:mb-4 line-clamp-2 hidden md:block">
                  {category.description || "No description"}
                </p>
                <div className="flex gap-1 md:gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 md:px-4 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-xs md:text-base"
                  >
                    <FaEdit className="text-xs md:text-base" />{" "}
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 md:px-4 md:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-xs md:text-base"
                  >
                    <FaTrash className="text-xs md:text-base" />{" "}
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--root-color)]"
                  placeholder="e.g., Sofas, Chairs, Tables"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--root-color)]"
                  placeholder="Category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Image (Optional - will override icon)
                </label>
                <div className="flex items-center gap-4">
                  {formData.image ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                      <img
                        src={formData.image}
                        alt="Category"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[var(--root-color)] transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={imageUploading}
                      />
                      {imageUploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[var(--root-color)]"></div>
                      ) : (
                        <>
                          <FaPlus className="text-gray-400 mb-1" />
                          <span className="text-xs text-gray-400">Upload</span>
                        </>
                      )}
                    </label>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Upload an image for the category. If no image is uploaded,
                    the icon will be used.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Icon {!formData.image && "*"}
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-xl">
                  {availableIcons.map((iconItem) => {
                    const IconComp = iconItem.icon;
                    return (
                      <button
                        key={iconItem.name}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, icon: iconItem.name })
                        }
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                          formData.icon === iconItem.name
                            ? "border-[var(--root-color)] bg-[var(--root-color)]/10 text-[var(--root-color)]"
                            : "border-gray-300 dark:border-gray-600 hover:border-[var(--root-color)] text-gray-600 dark:text-gray-400"
                        }`}
                        title={iconItem.label}
                      >
                        <IconComp className="text-2xl mb-1" />
                        <span className="text-xs text-center line-clamp-1">
                          {iconItem.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 text-[var(--root-color)] rounded focus:ring-2 focus:ring-[var(--root-color)]"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Active Category
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !formData.name || (!formData.icon && !formData.image)
                  }
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingCategory ? "Update" : "Create"} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pagination */}
      {categories.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={categories.length}
        />
      )}
    </div>
  );
};

export default AdminCategories;
