import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaTruck,
  FaBox,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      showToast("Please enter an order ID", "error");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data);
    } catch (error: any) {
      showToast(error.response?.data?.message || "Order not found", "error");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ["pending", "processing", "shipped", "delivered"];
    return steps.indexOf(status);
  };

  const statusIcons: any = {
    pending: FaBox,
    processing: FaSpinner,
    shipped: FaTruck,
    delivered: FaCheckCircle,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTruck className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Track Your Order
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your order ID to track your shipment
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="mb-10">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID (e.g., 507f1f77bcf86cd799439011)"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Tracking..." : "Track"}
            </button>
          </div>
        </form>

        {/* Order Details */}
        {order && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
            {/* Order Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Order ID
                </p>
                <p className="font-mono font-bold text-gray-900 dark:text-white">
                  #{order._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold ${
                    order.orderStatus === "delivered"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : order.orderStatus === "shipped"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : order.orderStatus === "cancelled"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {order.orderStatus.charAt(0).toUpperCase() +
                    order.orderStatus.slice(1)}
                </span>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                    style={{
                      width: `${(getStatusStep(order.orderStatus) / 3) * 100}%`,
                    }}
                  />
                </div>

                {["pending", "processing", "shipped", "delivered"].map(
                  (status, idx) => {
                    const Icon = statusIcons[status];
                    const isActive = getStatusStep(order.orderStatus) >= idx;
                    return (
                      <div
                        key={status}
                        className="relative z-10 flex flex-col items-center"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isActive
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium ${
                            isActive ? "text-purple-600" : "text-gray-400"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Order Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Shipping Address
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.shippingAddress?.fullName}
                  </p>
                  <p>{order.shippingAddress?.address}</p>
                  <p>{order.shippingAddress?.city}</p>
                  <p>{order.shippingAddress?.phone}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Order Summary
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Items
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {order.items?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Payment
                    </span>
                    <span
                      className={
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t dark:border-gray-600">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="font-bold text-purple-600">
                      Rs. {order.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* View Full Details */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate(`/order/${order._id}`)}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                View Full Order Details →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
