import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../services/api";
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaSpinner,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaArrowLeft,
  FaClock,
  FaClipboardList,
  FaFileDownload,
} from "react-icons/fa";
import InvoiceDownload from "../../components/orders/InvoiceDownload";

interface OrderItem {
  product: {
    _id: string;
    name: string;
    images: string[];
  };
  quantity: number;
  price: number;
}

interface TrackingHistory {
  status: string;
  message: string;
  timestamp: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  discount: number;
  orderStatus: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
  trackingNumber: string;
  trackingHistory: TrackingHistory[];
  estimatedDelivery: string;
  createdAt: string;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: FaClipboardList },
  { key: "processing", label: "Processing", icon: FaSpinner },
  { key: "shipped", label: "Shipped", icon: FaTruck },
  { key: "delivered", label: "Delivered", icon: FaCheckCircle },
];

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStep = () => {
    if (!order) return 0;
    if (order.orderStatus === "cancelled") return -1;
    return statusSteps.findIndex((s) => s.key === order.orderStatus);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--root-color)]"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <FaBox className="text-6xl text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
          Order Not Found
        </h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button
          onClick={() => navigate("/orders")}
          className="px-6 py-3 bg-[var(--root-color)] text-white rounded-xl font-bold"
        >
          View All Orders
        </button>
      </div>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 md:py-20">
      <div className="container px-4 md:px-6 lg:px-8 max-w-4xl mx-auto">
        
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[var(--root-color)] mb-6"
        >
          <FaArrowLeft /> Back to Orders
        </button>

        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  order.orderStatus === "delivered"
                    ? "bg-green-100 text-green-600"
                    : order.orderStatus === "cancelled"
                    ? "bg-red-100 text-red-600"
                    : order.orderStatus === "shipped"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {order.orderStatus.charAt(0).toUpperCase() +
                  order.orderStatus.slice(1)}
              </span>
              {order.trackingNumber && (
                <p className="text-sm text-gray-500">
                  Tracking:{" "}
                  <span className="font-mono font-bold">
                    {order.trackingNumber}
                  </span>
                </p>
              )}
              <InvoiceDownload orderId={order._id} />
            </div>
          </div>
        </div>

        
        {order.orderStatus !== "cancelled" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Order Progress
            </h2>

            <div className="relative">
              
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 mx-8">
                <div
                  className="h-full bg-[var(--root-color)] transition-all duration-500"
                  style={{
                    width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              
              <div className="relative flex justify-between">
                {statusSteps.map((step, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all ${
                          isCompleted
                            ? "bg-[var(--root-color)] text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                        } ${
                          isCurrent ? "ring-4 ring-[var(--root-color)]/30" : ""
                        }`}
                      >
                        <step.icon
                          className={isCurrent ? "animate-pulse" : ""}
                        />
                      </div>
                      <p
                        className={`mt-2 text-sm font-medium ${
                          isCompleted
                            ? "text-[var(--root-color)]"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            
            {order.estimatedDelivery && order.orderStatus !== "delivered" && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center gap-3">
                <FaClock className="text-blue-500 text-xl" />
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Estimated Delivery
                  </p>
                  <p className="text-blue-800 dark:text-blue-300 font-bold">
                    {new Date(order.estimatedDelivery).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        
        {order.orderStatus === "cancelled" && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 mb-6 border border-red-200 dark:border-red-800">
            <h3 className="text-lg font-bold text-red-600 mb-2">
              Order Cancelled
            </h3>
            <p className="text-red-500">This order has been cancelled.</p>
          </div>
        )}

        
        {order.trackingHistory && order.trackingHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Tracking History
            </h2>
            <div className="space-y-4">
              {order.trackingHistory.map((history, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        idx === 0 ? "bg-[var(--root-color)]" : "bg-gray-300"
                      }`}
                    />
                    {idx < order.trackingHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {history.status}
                    </p>
                    <p className="text-sm text-gray-500">{history.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(history.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <img
                    src={item.product?.images?.[0] || "/placeholder.png"}
                    alt={item.product?.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                      {item.product?.name || "Product"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Rs. {item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 mb-2">
                  <span>Discount</span>
                  <span>-Rs. {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-[var(--root-color)]">
                  Rs. {order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Shipping Address
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FaUser className="text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {order.shippingAddress.fullName}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {order.shippingAddress.phone}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-900 dark:text-white">
                    {order.shippingAddress.address}
                  </p>
                  <p className="text-gray-500">{order.shippingAddress.city}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OrderTracking;
