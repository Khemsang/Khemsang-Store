import { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Pagination } from "../../components/common";
import {
  FaShoppingCart,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaCalendar,
  FaMoneyBillWave,
} from "react-icons/fa";

interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  items: Array<{
    product: {
      _id: string;
      title: string;
      images: string[];
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
  createdAt: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const { success, error } = useToast();

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter((order) => order.orderStatus === statusFilter)
      );
    }
  }, [statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders");
      setOrders(data);
      setFilteredOrders(data);
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: status });
      success("Order status updated successfully!");
      fetchOrders();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to update order status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    return status === "paid"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
  };

  const statusOptions = [
    { value: "all", label: "All Orders", count: orders.length },
    {
      value: "pending",
      label: "Pending",
      count: orders.filter((o) => o.orderStatus === "pending").length,
    },
    {
      value: "processing",
      label: "Processing",
      count: orders.filter((o) => o.orderStatus === "processing").length,
    },
    {
      value: "shipped",
      label: "Shipped",
      count: orders.filter((o) => o.orderStatus === "shipped").length,
    },
    {
      value: "delivered",
      label: "Delivered",
      count: orders.filter((o) => o.orderStatus === "delivered").length,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      count: orders.filter((o) => o.orderStatus === "cancelled").length,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--root-color)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-4xl font-bold mb-2 flex items-center">
          <FaShoppingCart className="mr-3" />
          Orders Management
        </h2>
        <p className="text-white/90 text-lg">
          Manage and track all customer orders
        </p>
      </div>

      {/* Status Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-3">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                statusFilter === option.value
                  ? "bg-gradient-to-r from-[var(--root-color)] to-purple-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {option.label}
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-lg">
            <FaShoppingCart className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No orders found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {statusFilter === "all"
                ? "No orders have been placed yet"
                : `No ${statusFilter} orders`}
            </p>
          </div>
        ) : (
          paginatedOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              {/* Order Header */}
              <div className="flex flex-wrap justify-between items-start mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[var(--root-color)] to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                      #{order._id.slice(-6)}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FaCalendar className="text-xs" />
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <p className="text-3xl font-bold text-[var(--root-color)]">
                    Rs. {order.totalAmount?.toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus.toUpperCase()}
                    </span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus.toUpperCase()}
                    </span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        order.paymentMethod === "cod"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {order.paymentMethod === "cod" ? "💵 COD" : "💳 eSewa"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Customer Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <FaUser className="mr-2 text-[var(--root-color)]" />
                    Customer Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {order.user?.name || order.shippingAddress?.fullName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.user?.email}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FaPhone className="text-xs" />
                      {order.shippingAddress?.phone}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-[var(--root-color)]" />
                    Shipping Address
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {order.shippingAddress?.fullName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.shippingAddress?.address}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.shippingAddress?.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <FaShoppingCart className="mr-2 text-[var(--root-color)]" />
                  Order Items ({order.items.length})
                </h4>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                    >
                      <img
                        src={item.product?.images?.[0] || "/placeholder.jpg"}
                        alt={item.product?.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.product?.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Quantity: {item.quantity} × Rs.{" "}
                          {item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold text-[var(--root-color)]">
                        Rs. {(item.quantity * item.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Update Status:
                </label>
                <select
                  value={order.orderStatus}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--root-color)] focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredOrders.length}
        />
      )}
    </div>
  );
};

export default AdminOrders;
