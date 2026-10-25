import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useOrdersQuery } from "../../hooks/useOrdersAndWishlist";
import InvoiceDownload from "../../components/orders/InvoiceDownload";
import LazyImage from "../../components/common/LazyImage";
import { FaEye, FaBoxOpen } from "react-icons/fa";

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CLASSES: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipped:    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusClass = (s: string) =>
  STATUS_CLASSES[s.toLowerCase()] ?? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const OrderSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="h-20 bg-blue-200 dark:bg-blue-900/40" />
    <div className="p-6 space-y-4">
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      </div>
    </div>
  </div>
);

// ─── Error state ──────────────────────────────────────────────────────────────

const OrdersError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="text-center py-20">
    <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
      <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Failed to load orders
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6">
      Something went wrong. Please try again.
    </p>
    <button
      onClick={onRetry}
      className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
    >
      Retry
    </button>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const OrdersEmpty = ({ onShop }: { onShop: () => void }) => (
  <div className="text-center py-20">
    <FaBoxOpen className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      No orders yet
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      Start shopping to see your orders here
    </p>
    <button
      onClick={onShop}
      className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
    >
      Browse Products
    </button>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: orders = [], isLoading, isError, refetch } = useOrdersQuery(!!user);

  // Redirect handled by ProtectedRoute; this is a belt-and-suspenders guard
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            My Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your orders
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && <OrdersError onRetry={refetch} />}

        {/* Empty */}
        {!isLoading && !isError && orders.length === 0 && (
          <OrdersEmpty onShop={() => navigate("/products")} />
        )}

        {/* Orders list */}
        {!isLoading && !isError && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-sm opacity-90">Order ID</p>
                      <p className="font-bold text-lg">#{order._id.slice(-8)}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusClass(order.orderStatus)}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                      {order.paymentStatus.toLowerCase() !== "paid" && (
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusClass(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {order.items.map((item, idx) => {
                      const title = item.product?.title ?? "Product Unavailable";
                      const img   = item.product?.images?.[0] ?? "/placeholder.jpg";

                      return (
                        <div key={idx} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <LazyImage
                            src={img}
                            alt={title}
                            aspect="aspect-square"
                            className="w-full h-full object-cover rounded-lg"
                            wrapperClassName="w-20 h-20 shrink-0 rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {title}
                              {!item.product && (
                                <span className="ml-2 text-xs text-red-500">(Deleted)</span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-lg font-bold text-[var(--root-color)] mt-1">
                              Rs. {item.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Details */}
                  <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Shipping Address
                      </h4>
                      <address className="not-italic text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
                        <p>{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.phone}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}</p>
                      </address>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Order Summary
                      </h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-600 dark:text-gray-400">Payment</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {order.paymentMethod}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600 dark:text-gray-400">Date</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </dd>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                          <dt className="font-semibold text-gray-900 dark:text-white">Total</dt>
                          <dd className="font-bold text-xl text-[var(--root-color)]">
                            Rs. {order.totalAmount.toLocaleString()}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => navigate(`/order/${order._id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <FaEye /> Track Order
                    </button>
                    <InvoiceDownload orderId={order._id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Orders;
