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
  FaBox,
  FaSearch,
  FaEye,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCog,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const itemsPerPage = 10;
  const { success, error } = useToast();

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
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shippingAddress?.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [statusFilter, searchTerm, orders]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "pending":
        return <FaClock className="text-yellow-500" />;
      case "processing":
        return <FaCog className="text-blue-500 animate-spin" />;
      case "shipped":
        return <FaTruck className="text-purple-500" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaBox className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800";
    }
  };

  const statusOptions = [
    {
      value: "all",
      label: "All",
      count: orders.length,
      color: "from-gray-500 to-gray-600",
    },
    {
      value: "pending",
      label: "Pending",
      count: orders.filter((o) => o.orderStatus === "pending").length,
      color: "from-yellow-500 to-orange-500",
    },
    {
      value: "processing",
      label: "Processing",
      count: orders.filter((o) => o.orderStatus === "processing").length,
      color: "from-blue-500 to-cyan-500",
    },
    {
      value: "shipped",
      label: "Shipped",
      count: orders.filter((o) => o.orderStatus === "shipped").length,
      color: "from-purple-500 to-pink-500",
    },
    {
      value: "delivered",
      label: "Delivered",
      count: orders.filter((o) => o.orderStatus === "delivered").length,
      color: "from-green-500 to-emerald-500",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      count: orders.filter((o) => o.orderStatus === "cancelled").length,
      color: "from-red-500 to-rose-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-6 md:py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
            <FaShoppingCart className="text-emerald-600" /> Order Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {orders.length} total orders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`p-4 rounded-xl transition-all ${
                statusFilter === option.value
                  ? `bg-gradient-to-r ${option.color} text-white shadow-lg scale-105`
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
            >
              <p className="text-2xl font-bold">{option.count}</p>
              <p className="text-sm opacity-90">{option.label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order ID or customer name..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <FaShoppingCart className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No orders found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Try a different search term"
                  : statusFilter === "all"
                  ? "No orders have been placed yet"
                  : `No ${statusFilter} orders`}
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-600 dark:text-gray-300 text-sm">
                <div className="col-span-2">Order ID</div>
                <div className="col-span-3">Customer</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Action</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedOrders.map((order) => (
                  <div key={order._id}>
                    {/* Order Row */}
                    <div
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order._id ? null : order._id
                        )
                      }
                    >
                      {/* Order ID */}
                      <div className="md:col-span-2 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                          #{order._id.slice(-4)}
                        </div>
                        <div className="md:hidden flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {order.user?.name ||
                              order.shippingAddress?.fullName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Rs. {order.totalAmount?.toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`md:hidden px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>

                      {/* Customer */}
                      <div className="hidden md:flex md:col-span-3 items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <FaUser className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.user?.name ||
                              order.shippingAddress?.fullName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.user?.email || order.shippingAddress?.phone}
                          </p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="hidden md:flex md:col-span-2 items-center">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            Rs. {order.totalAmount?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.items.length} items
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="hidden md:flex md:col-span-2 items-center gap-2">
                        {getStatusIcon(order.orderStatus)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="hidden md:flex md:col-span-2 items-center text-sm text-gray-600 dark:text-gray-400">
                        <FaCalendar className="mr-2 text-xs" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>

                      {/* Action */}
                      <div className="hidden md:flex md:col-span-1 items-center">
                        <button className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                          <FaEye />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedOrder === order._id && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Customer Info */}
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <FaUser className="text-emerald-500" /> Customer
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p className="text-gray-900 dark:text-white font-medium">
                                {order.user?.name ||
                                  order.shippingAddress?.fullName}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {order.user?.email}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <FaPhone className="text-xs" />
                                {order.shippingAddress?.phone}
                              </p>
                            </div>
                          </div>

                          {/* Shipping Address */}
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <FaMapMarkerAlt className="text-emerald-500" />{" "}
                              Shipping
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p className="text-gray-900 dark:text-white font-medium">
                                {order.shippingAddress?.fullName}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {order.shippingAddress?.address}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {order.shippingAddress?.city}
                              </p>
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                              Payment
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Method
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {order.paymentMethod === "cod"
                                    ? "Cash on Delivery"
                                    : "eSewa"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Status
                                </span>
                                <span
                                  className={`font-medium ${
                                    order.paymentStatus === "paid"
                                      ? "text-green-600"
                                      : "text-orange-600"
                                  }`}
                                >
                                  {order.paymentStatus}
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  Total
                                </span>
                                <span className="font-bold text-emerald-600">
                                  Rs. {order.totalAmount?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <FaBox className="text-emerald-500" /> Items (
                            {order.items.length})
                          </h4>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              >
                                <img
                                  src={
                                    item.product?.images?.[0] ||
                                    "/placeholder.jpg"
                                  }
                                  alt={item.product?.title}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {item.product?.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.quantity} × Rs.{" "}
                                    {item.price.toLocaleString()}
                                  </p>
                                </div>
                                <p className="font-bold text-emerald-600">
                                  Rs.{" "}
                                  {(
                                    item.quantity * item.price
                                  ).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Update Status */}
                        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                          <label className="font-semibold text-gray-700 dark:text-gray-300">
                            Update Status:
                          </label>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateStatus(order._id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 sm:max-w-xs px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredOrders.length}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
