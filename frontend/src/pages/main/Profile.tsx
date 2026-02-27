import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import { uploadImage } from "../../utils/imageUpload";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCamera,
  FaSave,
  FaLock,
  FaShoppingBag,
  FaHeart,
  FaStar,
  FaChartLine,
  FaClock,
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "addresses" | "password" | "orders" | "activity"
  >("profile");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    isDefault: false,
  });

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    avatar: user?.avatar || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    reviewsGiven: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const fetchStats = () => {
    api
      .get("/auth/stats")
      .then((res) => {
        setUserStats(res.data);
      })
      .catch(console.error);
  };

  const fetchOrders = () => {
    api
      .get("/orders/my-orders")
      .then((res) => {
        setOrders(res.data);
      })
      .catch(console.error);
  };

  const fetchActivities = () => {
    api
      .get("/activities")
      .then((res) => {
        setActivities(res.data);
      })
      .catch(console.error);
  };

  const fetchAddresses = () => {
    api
      .get("/auth/addresses")
      .then((res) => setAddresses(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
    });
    fetchStats();
    fetchActivities();
    fetchOrders();
    fetchAddresses();
  }, [user]);

  // Refresh data when tab changes
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
      fetchStats();
    } else if (activeTab === "activity") {
      fetchActivities();
    } else if (activeTab === "addresses") {
      fetchAddresses();
    }
  }, [activeTab]);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAddress) {
        await api.put(`/auth/addresses/${editingAddress._id}`, addressForm);
        showToast("Address updated", "success");
      } else {
        await api.post("/auth/addresses", addressForm);
        showToast("Address added", "success");
      }
      fetchAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        label: "Home",
        fullName: "",
        phone: "",
        address: "",
        city: "",
        isDefault: false,
      });
    } catch {
      showToast("Failed to save address", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await api.delete(`/auth/addresses/${addressId}`);
      showToast("Address deleted", "success");
      fetchAddresses();
    } catch {
      showToast("Failed to delete address", "error");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)
      return showToast(
        file?.size > 5 * 1024 * 1024 ? "Max 5MB" : "Select image",
        "error"
      );
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData({ ...formData, avatar: url });
      showToast("Image uploaded", "success");
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put("/auth/profile", formData);
      updateUser(data.user);
      showToast("Profile updated", "success");
    } catch {
      showToast("Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword)
      return showToast("Passwords do not match", "error");
    if (passwordData.newPassword.length < 6)
      return showToast("Min 6 chars", "error");
    setLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showToast("Password changed", "success");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      showToast("Change failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "profile", label: "Profile Info" },
    { key: "addresses", label: "Addresses" },
    { key: "orders", label: "My Orders" },
    { key: "activity", label: "Activity" },
    { key: "password", label: "Password" },
  ];

  const activityIcons: Record<string, string> = {
    FaUserPlus: "👤",
    FaEdit: "✏️",
    FaLock: "🔒",
    FaShoppingCart: "🛒",
    FaTimesCircle: "❌",
    FaStar: "⭐",
    FaEye: "👁️",
    FaHeart: "❤️",
    FaShoppingBag: "🛍️",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4 shadow-lg">
            <FaUser className="text-white text-2xl" />
            <span className="text-white font-bold text-lg">My Profile</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-3">
            Account Dashboard
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Orders",
              value: userStats.totalOrders,
              icon: <FaBox />,
              from: "blue-500",
              to: "blue-600",
            },
            {
              label: "Completed",
              value: userStats.completedOrders,
              icon: <FaCheckCircle />,
              from: "green-500",
              to: "green-600",
            },
            {
              label: "Wishlist",
              value: userStats.wishlistItems,
              icon: <FaHeart />,
              from: "purple-500",
              to: "purple-600",
            },
            {
              label: "Reviews",
              value: userStats.reviewsGiven,
              icon: <FaStar />,
              from: "orange-500",
              to: "orange-600",
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`bg-gradient-to-br from-${card.from} to-${card.to} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow`}
            >
              <div className="flex items-center justify-between mb-2">
                {card.icon}
                <span className="text-3xl font-bold">{card.value}</span>
              </div>
              <p className="text-white font-semibold">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-800"></div>
          </div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl ring-4 ring-purple-500">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold">
                      {formData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center cursor-pointer hover:from-purple-700 hover:to-pink-700 transition shadow-lg">
                  <FaCamera className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {formData.name}
                </h2>
                <div className="space-y-2 mb-4">
                  {[
                    {
                      icon: <FaEnvelope className="text-purple-600" />,
                      value: formData.email,
                    },
                    {
                      icon: <FaPhone className="text-purple-600" />,
                      value: formData.phone,
                    },
                    {
                      icon: <FaMapMarkerAlt className="text-purple-600" />,
                      value: formData.address,
                    },
                  ].map(
                    (item, i) =>
                      item.value && (
                        <p
                          key={i}
                          className="text-gray-600 dark:text-gray-400 flex items-center gap-2 justify-center md:justify-start"
                        >
                          {item.icon}
                          {item.value}
                        </p>
                      )
                  )}
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 justify-center md:justify-start">
                    <FaClock className="text-purple-600" />
                    Member since{" "}
                    {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-8">
              <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
                      activeTab === tab.key
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileUpdate} className="space-y-5">
                  {["name", "email", "phone", "address"].map((key, i) => (
                    <div key={i}>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        {key === "name" ? (
                          <FaUser className="text-purple-600" />
                        ) : key === "email" ? (
                          <FaEnvelope className="text-purple-600" />
                        ) : key === "phone" ? (
                          <FaPhone className="text-purple-600" />
                        ) : (
                          <FaMapMarkerAlt className="text-purple-600" />
                        )}{" "}
                        {key.charAt(0).toUpperCase() + key.slice(1)}{" "}
                        {key === "name" || key === "email" ? "*" : ""}
                      </label>
                      <input
                        type={
                          key === "email"
                            ? "email"
                            : key === "phone"
                            ? "tel"
                            : "text"
                        }
                        required={key === "name" || key === "email"}
                        value={(formData as any)[key]}
                        onChange={(e) =>
                          setFormData({ ...formData, [key]: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-semibold flex items-center gap-2"
                  >
                    <FaSave />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              )}

              {activeTab === "addresses" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      Saved Addresses
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddressForm(true);
                        setEditingAddress(null);
                        setAddressForm({
                          label: "Home",
                          fullName: "",
                          phone: "",
                          address: "",
                          city: "",
                          isDefault: false,
                        });
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-semibold"
                    >
                      + Add Address
                    </button>
                  </div>

                  {showAddressForm && (
                    <form
                      onSubmit={handleAddressSubmit}
                      className="bg-purple-50 dark:bg-gray-700 rounded-xl p-4 space-y-4 mb-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Label
                          </label>
                          <select
                            value={addressForm.label}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                label: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.fullName}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                fullName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            required
                            value={addressForm.phone}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.city}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                city: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Address
                        </label>
                        <textarea
                          required
                          value={addressForm.address}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              address: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          rows={2}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={addressForm.isDefault}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              isDefault: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <label
                          htmlFor="isDefault"
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          Set as default address
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-semibold"
                        >
                          {loading
                            ? "Saving..."
                            : editingAddress
                            ? "Update"
                            : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                          }}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {addresses.length === 0 && !showAddressForm ? (
                    <div className="text-center py-12">
                      <FaMapMarkerAlt className="mx-auto text-6xl text-gray-300 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No saved addresses
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr._id}
                          className={`bg-white dark:bg-gray-700 rounded-xl p-4 border-2 ${
                            addr.isDefault
                              ? "border-purple-500"
                              : "border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded">
                                  {addr.label}
                                </span>
                                {addr.isDefault && (
                                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-gray-800 dark:text-white">
                                {addr.fullName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {addr.phone}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {addr.address}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {addr.city}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingAddress(addr);
                                  setAddressForm(addr);
                                  setShowAddressForm(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr._id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
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
              )}

              {activeTab === "orders" && (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <FaShoppingBag className="mx-auto text-6xl text-gray-300 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        No orders yet
                      </p>
                      <button
                        onClick={() => navigate("/products")}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-semibold"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <div
                        key={order._id}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                              #{order._id.slice(-4)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-white">
                                Order #{order._id.slice(-8)}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-600">
                              Rs. {order.totalAmount.toLocaleString()}
                            </p>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                order.orderStatus === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.orderStatus === "shipped"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto">
                          {order.items
                            .slice(0, 3)
                            .map((item: any, i: number) => (
                              <img
                                key={i}
                                src={item.product.images[0]}
                                alt=""
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ))}
                          {order.items.length > 3 && (
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-sm font-bold">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {orders.length > 5 && (
                    <button
                      onClick={() => navigate("/orders")}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-semibold"
                    >
                      View All Orders
                    </button>
                  )}
                </div>
              )}

              {activeTab === "activity" && (
                <div className="space-y-3">
                  {activities.length === 0 ? (
                    <div className="text-center py-12">
                      <FaChartLine className="mx-auto text-6xl text-gray-300 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No recent activity
                      </p>
                    </div>
                  ) : (
                    activities.slice(0, 10).map((activity, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 rounded-xl hover:shadow-md transition-shadow"
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xl">
                          {activityIcons[activity.icon] || "📌"}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "password" && (
                <form
                  onSubmit={handlePasswordChange}
                  className="space-y-5 max-w-md"
                >
                  {["currentPassword", "newPassword", "confirmPassword"].map(
                    (key, i) => (
                      <div key={i}>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <FaLock className="text-purple-600" />{" "}
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (s) => s.toUpperCase())}{" "}
                          *
                        </label>
                        <input
                          type="password"
                          required
                          value={(passwordData as any)[key]}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              [key]: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    )
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-semibold flex items-center gap-2"
                  >
                    <FaLock />
                    {loading ? "Changing..." : "Change Password"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
