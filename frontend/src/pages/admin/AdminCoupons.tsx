import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaTicketAlt,
  FaPercent,
  FaRupeeSign,
  FaCopy,
} from "react-icons/fa";

interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscount: "",
    usageLimit: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/coupons");
      setCoupons(data);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to fetch coupons",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.endDate) {
      showToast("Code and end date are required", "error");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      };

      if (editingId) {
        await api.put(`/coupons/${editingId}`, payload);
        showToast("Coupon updated successfully", "success");
      } else {
        await api.post("/coupons", payload);
        showToast("Coupon created successfully", "success");
      }
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to save coupon",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      startDate: coupon.startDate.split("T")[0],
      endDate: coupon.endDate.split("T")[0],
      isActive: coupon.isActive,
    });
    setEditingId(coupon._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      showToast("Coupon deleted", "success");
      fetchCoupons();
    } catch (error: any) {
      showToast("Failed to delete coupon", "error");
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      fetchCoupons();
    } catch (error) {
      showToast("Failed to update coupon", "error");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast("Code copied!", "success");
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 0,
      maxDiscount: "",
      usageLimit: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 py-6 md:py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-3">
              <FaTicketAlt className="text-purple-600" /> Coupon Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create and manage discount coupons
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:opacity-90"
          >
            <FaPlus /> Create Coupon
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingId ? "Edit Coupon" : "Create Coupon"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Code */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white uppercase"
                      placeholder="SAVE20"
                      required
                    />
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Discount Type
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountType: e.target.value as
                            | "percentage"
                            | "fixed",
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs.)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Discount Value *
                    </label>
                    <div className="relative">
                      {formData.discountType === "percentage" ? (
                        <FaPercent className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      ) : (
                        <FaRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      )}
                      <input
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountValue: Number(e.target.value),
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  {/* Min Order */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Min Order Amount
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderAmount: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      min="0"
                    />
                  </div>

                  {/* Max Discount */}
                  {formData.discountType === "percentage" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Max Discount (Rs.)
                      </label>
                      <input
                        type="number"
                        value={formData.maxDiscount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxDiscount: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Optional"
                      />
                    </div>
                  )}

                  {/* Usage Limit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) =>
                        setFormData({ ...formData, usageLimit: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Unlimited"
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    rows={2}
                    placeholder="Optional description"
                  />
                </div>

                {/* Active Toggle */}
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

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaSave /> {saving ? "Saving..." : "Save Coupon"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Coupons List */}
        {coupons.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
            <FaTicketAlt className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No Coupons Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first discount coupon
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold"
            >
              <FaPlus className="inline mr-2" /> Create Coupon
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 ${
                  !coupon.isActive
                    ? "border-gray-300 opacity-60"
                    : isExpired(coupon.endDate)
                    ? "border-red-500"
                    : "border-green-500"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 font-mono font-bold text-lg rounded-lg">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className="p-2 text-gray-400 hover:text-purple-600"
                      >
                        <FaCopy />
                      </button>
                      {isExpired(coupon.endDate) && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                          EXPIRED
                        </span>
                      )}
                      {!coupon.isActive && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {coupon.description || "No description"}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong>
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `Rs.${coupon.discountValue}`}
                        </strong>{" "}
                        off
                      </span>
                      {coupon.minOrderAmount > 0 && (
                        <span className="text-gray-500">
                          Min: Rs.{coupon.minOrderAmount}
                        </span>
                      )}
                      {coupon.maxDiscount && (
                        <span className="text-gray-500">
                          Max: Rs.{coupon.maxDiscount}
                        </span>
                      )}
                      <span className="text-gray-500">
                        Used: {coupon.usedCount}/{coupon.usageLimit || "∞"}
                      </span>
                      <span className="text-gray-500">
                        Valid: {new Date(coupon.startDate).toLocaleDateString()}{" "}
                        - {new Date(coupon.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(coupon)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        coupon.isActive
                          ? "bg-orange-100 text-orange-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {coupon.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg"
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

export default AdminCoupons;
