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
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "orders" | "activity"
  >("profile");

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
        console.log("📊 Stats updated:", res.data);
        setUserStats(res.data);
      })
      .catch(console.error);
  };

  const fetchOrders = () => {
    api
      .get("/orders/my-orders")
      .then((res) => {
        console.log("📦 Orders updated:", res.data.length);
        setOrders(res.data);
      })
      .catch(console.error);
  };

  const fetchActivities = () => {
    api
      .get("/activities")
      .then((res) => {
        console.log("📋 Activities updated:", res.data.length);
        setActivities(res.data);
      })
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
  }, [user]);

  // Refresh data when tab changes
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
      fetchStats();
    } else if (activeTab === "activity") {
      fetchActivities();
    }
  }, [activeTab]);

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
