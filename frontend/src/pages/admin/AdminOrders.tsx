import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Loading } from "../../components/ui/loading";
import { Package, Eye, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatCurrency } from "../../utils/constants";

interface Order {
  _id: string;
  user: { name: string; email: string };
  items: any[];
  totalAmount: number;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: any;
  createdAt: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: status });
      success("Order status updated");
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      error("Failed to update status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      case "shipped":
        return "info";
      default:
        return "warning";
    }
  };

  if (loading) return <Loading message="Loading orders..." variant="delivery" />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-gray-500 mt-1">{orders.length} total orders</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">#{order._id.slice(-8)}</h3>
                    <Badge variant={getStatusVariant(order.orderStatus)}>
                      {getStatusIcon(order.orderStatus)}
                      <span className="ml-1">{order.orderStatus}</span>
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <span className="font-medium">Customer:</span> {order.user?.name || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Items:</span> {order.items?.length || 0}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Payment:</span> {order.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No orders found</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-bold mb-2">Customer</h3>
                  <p>{selectedOrder.user?.name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.user?.email}</p>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-bold mb-2">Shipping Address</h3>
                  <p>{selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.shippingAddress?.address}</p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.shippingAddress?.city} - {selectedOrder.shippingAddress?.phone}
                  </p>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-bold mb-2">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>
                          {item.product?.title || "Product"} x {item.quantity}
                        </span>
                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h3 className="font-bold mb-2">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={selectedOrder.orderStatus === status ? "default" : "outline"}
                        onClick={() => updateStatus(selectedOrder._id, status)}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
