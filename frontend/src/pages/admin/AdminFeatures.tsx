import { useState, useEffect } from "react";
import { featuresApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  FaStar,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
} from "react-icons/fa";

interface Feature {
  _id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
}

const iconOptions = [
  { name: "FaAward", label: "Award", icon: "🏆" },
  { name: "FaUsers", label: "Users", icon: "👥" },
  { name: "FaHeart", label: "Heart", icon: "❤️" },
  { name: "FaShieldAlt", label: "Shield", icon: "🛡️" },
  { name: "FaStar", label: "Star", icon: "⭐" },
  { name: "FaHandshake", label: "Handshake", icon: "🤝" },
  { name: "FaLeaf", label: "Leaf", icon: "🍃" },
  { name: "FaTruck", label: "Truck", icon: "🚚" },
  { name: "FaClock", label: "Clock", icon: "⏰" },
  { name: "FaCheckCircle", label: "Check", icon: "✅" },
];

const colorOptions = [
  { name: "Blue-Purple", value: "from-blue-500 to-purple-500" },
  { name: "Purple-Pink", value: "from-purple-500 to-pink-500" },
  { name: "Pink-Red", value: "from-pink-500 to-red-500" },
  { name: "Green-Emerald", value: "from-green-500 to-emerald-500" },
  { name: "Orange-Yellow", value: "from-orange-500 to-yellow-500" },
  { name: "Cyan-Blue", value: "from-cyan-500 to-blue-500" },
];

const AdminFeatures = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "FaStar",
    color: "from-blue-500 to-purple-500",
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const { data } = await featuresApi.getAll(true);
      setFeatures(data);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to fetch features",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFeature) {
        await featuresApi.update(editingFeature._id, formData);
        showToast("Feature updated successfully", "success");
      } else {
        await featuresApi.create(formData);
        showToast("Feature created successfully", "success");
      }
      fetchFeatures();
      handleCloseModal();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to save feature",
        "error"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feature?")) return;
    try {
      await featuresApi.delete(id);
      showToast("Feature deleted successfully", "success");
      fetchFeatures();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to delete feature",
        "error"
      );
    }
  };

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      color: feature.color,
      isActive: feature.isActive,
      order: feature.order,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFeature(null);
    setFormData({
      title: "",
      description: "",
      icon: "FaStar",
      color: "from-blue-500 to-purple-500",
      isActive: true,
      order: 0,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            Loading Features...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 py-6 md:py-8">
      <div className="container">
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-3 shadow-lg">
                <FaStar className="text-white text-2xl" />
                <span className="text-white font-bold text-lg">
                  Features Manager
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Manage Features
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Create and manage website features/benefits
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <FaPlus />
              Add Feature
            </button>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature._id}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-purple-100 dark:border-purple-900/30 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}
                >
                  {iconOptions.find((i) => i.name === feature.icon)?.icon ||
                    "⭐"}
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      feature.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {feature.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {feature.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(feature)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition font-semibold"
                >
                  <FaEdit />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(feature._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition font-semibold"
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {features.length === 0 && (
          <div className="text-center py-20">
            <FaStar className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              No Features Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first feature!
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-semibold"
            >
              <FaPlus />
              Create Feature
            </button>
          </div>
        )}

        
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FaStar />
                    {editingFeature ? "Edit Feature" : "Create New Feature"}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Premium Quality"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Top-notch products with attention to every detail"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Icon *
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, icon: icon.name })
                        }
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.icon === icon.name
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                            : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                        }`}
                      >
                        <div className="text-3xl">{icon.icon}</div>
                        <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                          {icon.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Color Gradient *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, color: color.value })
                        }
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.color === color.value
                            ? "border-purple-500"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div
                          className={`h-8 rounded-lg bg-gradient-to-r ${color.value} mb-2`}
                        ></div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {color.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.isActive ? "active" : "inactive"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.value === "active",
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-semibold"
                  >
                    <FaSave />
                    {editingFeature ? "Update Feature" : "Create Feature"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeatures;
