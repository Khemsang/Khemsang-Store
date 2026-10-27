import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useMinimumLoading } from "../../hooks/useMinimumLoading";
import { uploadImage } from "../../utils/imageUpload";
import Loading from "../../components/common/Loading";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaUpload,
  FaGlobe,
  FaImage,
  FaGripVertical,
} from "react-icons/fa";

interface Brand {
  _id: string;
  name: string;
  logo: string;
  website: string;
  isActive: boolean;
  order: number;
}

const AdminBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumLoading(loading, 1000);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    website: "",
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/brands/all");
      setBrands(data);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to fetch brands",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.logo) {
      showToast("Name and logo are required", "error");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await api.put(`/brands/${editingId}`, formData);
        showToast("Brand updated successfully", "success");
      } else {
        await api.post("/brands", { ...formData, order: brands.length });
        showToast("Brand created successfully", "success");
      }
      resetForm();
      fetchBrands();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to save brand",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setFormData({
      name: brand.name,
      logo: brand.logo,
      website: brand.website || "",
      isActive: brand.isActive,
      order: brand.order,
    });
    setEditingId(brand._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    try {
      await api.delete(`/brands/${id}`);
      showToast("Brand deleted successfully", "success");
      fetchBrands();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to delete brand",
        "error"
      );
    }
  };

  const handleToggleActive = async (brand: Brand) => {
    try {
      await api.put(`/brands/${brand._id}`, { isActive: !brand.isActive });
      fetchBrands();
    } catch (error: any) {
      showToast("Failed to update brand", "error");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadImage(file);
      setFormData({ ...formData, logo: imageUrl });
      showToast("Logo uploaded successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to upload logo", "error");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", logo: "", website: "", isActive: true, order: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  if (showLoading) {
    return <Loading text="Loading brands..." fullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 py-6 md:py-8">
      <div className="container">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Brand Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage partner brands displayed on homepage
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            <FaPlus /> Add Brand
          </button>
        </div>

        
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingId ? "Edit Brand" : "Add New Brand"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter brand name"
                    required
                  />
                </div>

                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Logo *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.logo}
                      onChange={(e) =>
                        setFormData({ ...formData, logo: e.target.value })
                      }
                      className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Logo URL"
                    />
                    <label className="cursor-pointer px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition flex items-center gap-2">
                      <FaUpload />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  {uploading && (
                    <p className="text-sm text-purple-500 mt-1">Uploading...</p>
                  )}
                  {formData.logo && (
                    <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
                      <img
                        src={formData.logo}
                        alt="Preview"
                        className="h-16 object-contain mx-auto"
                      />
                    </div>
                  )}
                </div>

                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Website URL (optional)
                  </label>
                  <div className="relative">
                    <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isActive: !formData.isActive })
                    }
                    className={`w-14 h-8 rounded-full transition-colors ${
                      formData.isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                        formData.isActive ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-xl font-bold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaSave /> {saving ? "Saving..." : "Save Brand"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        
        {brands.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
            <FaImage className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No Brands Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Add your first brand to display on homepage
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold"
            >
              <FaPlus className="inline mr-2" /> Add Brand
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {brands.map((brand) => (
              <div
                key={brand._id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 transition-all ${
                  brand.isActive
                    ? "border-green-200 dark:border-green-800"
                    : "border-gray-200 dark:border-gray-700 opacity-60"
                }`}
              >
                
                <div className="p-6 bg-gray-50 dark:bg-gray-700 flex items-center justify-center h-32">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {brand.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${
                        brand.isActive
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {brand.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:underline flex items-center gap-1 mb-3"
                    >
                      <FaGlobe className="text-xs" /> Visit Website
                    </a>
                  )}

                  
                  <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => handleToggleActive(brand)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        brand.isActive
                          ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                    >
                      {brand.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleEdit(brand)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(brand._id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBrands;
