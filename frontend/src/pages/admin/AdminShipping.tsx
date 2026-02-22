import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Loading from "../../components/common/Loading";
import {
  FaTruck,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaEdit,
  FaSave,
  FaTimes,
  FaShippingFast,
  FaMapMarkerAlt,
} from "react-icons/fa";

interface Order {
  _id: string;
  user: { name: string; email: string };
  items: Array<{ product: { title: string }; quantity: number }>;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
  trackingNumber: string;
  estimatedDelivery: string;
  createdAt: string;
}

const AdminShipping = () => {
  const { success, error } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateShipping = async (orderId: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        orderStatus: newStatus,
        trackingNumber,
        estimatedDelivery: estimatedDelivery || undefined,
      });

      setOrders(
        orders.map((o) =>
          o._id === orderId
            ? {
                ...o,
                orderStatus: newStatus,
                trackingNumber,
                estimatedDelivery,
              }
            : o
        )
      );
      success("Shipping info updated successfully");
      setEditingOrder(null);
    } catch (err) {
      error("Failed to update shipping");
    }
  };

  const filteredOrders = orders
    .filter((o) => {
      if (statusFilter === "all") return true;
      return o.orderStatus === statusFilter;
    })
    .filter(
      (o) =>
        o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shippingAddress?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        o.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = {
    pending: orders.filter((o) => o.orderStatus === "pending").length,
    processing: orders.filter((o) => o.orderStatus === "processing").length,
    shipped: orders.filter((o) => o.orderStatus === "shipped").length,
    delivered: orders.filter((o) => o.orderStatus === "delivered").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "shipped":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (loading) {
    return <Loading text="Loading shipping data..." fullScreen={true} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Shipping Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage order shipping and tracking
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Pending",
            value: stats.pending,
            icon: FaClock,
            color: "yellow",
          },
          {
            label: "Processing",
            value: stats.processing,
            icon: FaBox,
            color: "blue",
          },
          {
            label: "Shipped",
            value: stats.shipped,
            icon: FaTruck,
            color: "purple",
          },
          {
            label: "Delivered",
            value: stats.delivered,
            icon: FaCheckCircle,
            color: "green",
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setStatusFilter(stat.label.toLowerCase())}
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 cursor-pointer transition-all ${
              statusFilter === stat.label.toLowerCase()
                ? `border-${stat.color}-500`
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-lg`}
              >
                <stat.icon
                  className={`text-${stat.color}-600 dark:text-${stat.color}-400`}
                />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer, or tracking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-[var(--root-color)] text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            All Orders
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-[var(--root-color)] to-purple-600 rounded-xl">
                      <FaShippingFast className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus.toUpperCase()}
                    </span>
                    {editingOrder !== order._id && (
                      <button
                        onClick={() => {
                          setEditingOrder(order._id);
                          setTrackingNumber(order.trackingNumber || "");
                          setEstimatedDelivery(
                            order.estimatedDelivery?.split("T")[0] || ""
                          );
                          setNewStatus(order.orderStatus);
                        }}
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                      >
                        <FaEdit />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Customer Info */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Customer
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.shippingAddress?.fullName || order.user?.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.shippingAddress?.phone}
                    </p>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1">
                      <FaMapMarkerAlt /> Shipping To
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {order.shippingAddress?.address}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.shippingAddress?.city}
                    </p>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Order Summary
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.items?.length || 0} items
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      Rs. {order.totalAmount?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Edit Form */}
                {editingOrder === order._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tracking Number
                        </label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Enter tracking ID"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Est. Delivery
                        </label>
                        <input
                          type="date"
                          value={estimatedDelivery}
                          onChange={(e) => setEstimatedDelivery(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <button
                          onClick={() => updateShipping(order._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <FaSave /> Save
                        </button>
                        <button
                          onClick={() => setEditingOrder(null)}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Tracking Info */}
                {order.trackingNumber && editingOrder !== order._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FaTruck className="text-[var(--root-color)]" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Tracking:
                      </span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                        {order.trackingNumber}
                      </span>
                    </div>
                    {order.estimatedDelivery && (
                      <div className="flex items-center gap-2">
                        <FaClock className="text-[var(--root-color)]" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Est. Delivery:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(
                            order.estimatedDelivery
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <FaTruck className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShipping;
