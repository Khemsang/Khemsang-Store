import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Loading } from "../../components/ui/loading";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../../components/ui/dialog";
import {
  Package,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Check,
} from "lucide-react";
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
  discount?: number;
  trackingNumber?: string;
  isRead?: boolean;
  readBy?: Array<{ admin: string; readAt: string }>;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState("pending"); // Default to pending
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const { success, error } = useToast();

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const fetchOrders = async (status: string = "pending") => {
    try {
      setLoading(true);
      const url = status === "all" ? "/orders" : `/orders?status=${status}`;
      const { data } = await api.get(url);
      
      // Remove any potential duplicates by order ID
      const uniqueOrders = data.filter((order: Order, index: number, self: Order[]) =>
        index === self.findIndex((o) => o._id === order._id)
      );
      
      setOrders(uniqueOrders);
    } catch (err) {
      error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (orderId: string) => {
    try {
      await api.put(`/orders/${orderId}/mark-read`);
      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, isRead: true } : order
        )
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, isRead: true });
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    markAsRead(order._id);
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingStatus(true);
      await api.put(`/orders/${orderId}/status`, { orderStatus: status });
      success("Order status updated successfully");
      
      // Close dialogs first
      setShowStatusConfirm(false);
      setPendingStatus("");
      setSelectedOrder(null);
      
      // Refresh orders to get clean updated list
      await fetchOrders(activeTab);
    } catch (err) {
      error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusChange = (status: string) => {
    setPendingStatus(status);
    setShowStatusConfirm(true);
  };

  const confirmStatusUpdate = () => {
    if (selectedOrder && pendingStatus) {
      updateStatus(selectedOrder._id, pendingStatus);
    }
  };

  // Calculate revenue statistics
  const calculateRevenue = () => {
    const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const unreadCount = orders.filter((o) => !o.isRead).length;
    
    const revenueByStatus = {
      pending: orders
        .filter((o) => o.orderStatus === "pending" && o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.totalAmount, 0),
      processing: orders
        .filter((o) => o.orderStatus === "processing" && o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.totalAmount, 0),
      shipped: orders
        .filter((o) => o.orderStatus === "shipped" && o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.totalAmount, 0),
      delivered: orders
        .filter((o) => o.orderStatus === "delivered" && o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };

    return { totalRevenue, paidOrders: paidOrders.length, revenueByStatus, unreadCount };
  };

  const revenue = calculateRevenue();

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
      {/* Header with Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(revenue.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Paid Orders</p>
                <p className="text-2xl font-bold">{revenue.paidOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Shipped</p>
                <p className="text-2xl font-bold">
                  {orders.filter((o) => o.orderStatus === "shipped").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">
                  {orders.filter((o) => o.orderStatus === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
              >
                All Orders ({orders.length})
              </TabsTrigger>
              <TabsTrigger
                active={activeTab === "pending"}
                onClick={() => setActiveTab("pending")}
              >
                <Clock className="w-4 h-4 mr-1" />
                Pending
              </TabsTrigger>
              <TabsTrigger
                active={activeTab === "processing"}
                onClick={() => setActiveTab("processing")}
              >
                <Package className="w-4 h-4 mr-1" />
                Processing
              </TabsTrigger>
              <TabsTrigger
                active={activeTab === "shipped"}
                onClick={() => setActiveTab("shipped")}
              >
                <Truck className="w-4 h-4 mr-1" />
                Shipped
              </TabsTrigger>
              <TabsTrigger
                active={activeTab === "delivered"}
                onClick={() => setActiveTab("delivered")}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Delivered
              </TabsTrigger>
              <TabsTrigger
                active={activeTab === "cancelled"}
                onClick={() => setActiveTab("cancelled")}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Cancelled
              </TabsTrigger>
            </TabsList>

            <TabsContent>
              {/* Orders List */}
              <div className="space-y-4 mt-6">
                {orders.map((order) => (
                  <Card
                    key={order._id}
                    className={`hover:shadow-lg transition-shadow ${
                      !order.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10" : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h3 className={`text-lg ${!order.isRead ? "font-extrabold" : "font-bold"}`}>
                              #{order._id.slice(-8)}
                            </h3>
                            {!order.isRead && (
                              <Badge variant="info" className="animate-pulse">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                New
                              </Badge>
                            )}
                            <Badge variant={getStatusVariant(order.orderStatus)}>
                              {getStatusIcon(order.orderStatus)}
                              <span className="ml-1 capitalize">{order.orderStatus}</span>
                            </Badge>
                            <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>
                              {order.paymentStatus}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className={`flex items-center gap-2 ${!order.isRead ? "font-bold" : ""}`}>
                              <Mail className="w-4 h-4" />
                              <span>{order.user?.name || "N/A"}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${!order.isRead ? "font-bold" : ""}`}>
                              <ShoppingBag className="w-4 h-4" />
                              <span>{order.items?.length || 0} items</span>
                            </div>
                            <div className={`flex items-center gap-2 ${!order.isRead ? "font-bold" : ""}`}>
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${!order.isRead ? "font-bold" : ""}`}>
                              <DollarSign className="w-4 h-4" />
                              <span>{order.paymentMethod}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <p className={`text-3xl text-green-600 ${!order.isRead ? "font-extrabold" : "font-bold"}`}>
                              {formatCurrency(order.totalAmount)}
                            </p>
                            {order.discount && order.discount > 0 && (
                              <p className="text-sm text-gray-500">
                                Discount: {formatCurrency(order.discount)}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(order)}
                            className={!order.isRead ? "font-bold border-2 border-blue-500" : ""}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {orders.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No orders found</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?._id.slice(-8)}</DialogTitle>
            <DialogClose onClick={() => setSelectedOrder(null)} />
          </DialogHeader>

          {selectedOrder && (
            <div className="p-6 space-y-6">
              {/* Order Status and Payment */}
              <div className="flex items-center gap-3">
                <Badge variant={getStatusVariant(selectedOrder.orderStatus)} className="text-base px-3 py-1">
                  {getStatusIcon(selectedOrder.orderStatus)}
                  <span className="ml-2 capitalize">{selectedOrder.orderStatus}</span>
                </Badge>
                <Badge
                  variant={selectedOrder.paymentStatus === "paid" ? "success" : "warning"}
                  className="text-base px-3 py-1"
                >
                  {selectedOrder.paymentStatus}
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Name:</span> {selectedOrder.user?.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {selectedOrder.user?.email}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedOrder.shippingAddress?.fullName}
                  </p>
                  {selectedOrder.shippingAddress?.email && (
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedOrder.shippingAddress.email}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {selectedOrder.shippingAddress?.phone}
                  </p>
                  <p>{selectedOrder.shippingAddress?.address}</p>
                  <p>
                    {selectedOrder.shippingAddress?.city}
                    {selectedOrder.shippingAddress?.postalCode &&
                      ` - ${selectedOrder.shippingAddress.postalCode}`}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.product?.title || "Product"}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="font-bold">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>
                      {formatCurrency(
                        selectedOrder.totalAmount + (selectedOrder.discount || 0)
                      )}
                    </span>
                  </div>
                  {selectedOrder.discount && selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-green-600">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Update Order Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                    <Button
                      key={status}
                      size="lg"
                      variant={selectedOrder.orderStatus === status ? "default" : "outline"}
                      onClick={() => handleStatusChange(status)}
                      className={`capitalize font-semibold ${
                        selectedOrder.orderStatus === status
                          ? "ring-2 ring-blue-500 ring-offset-2"
                          : ""
                      }`}
                      disabled={updatingStatus}
                    >
                      {getStatusIcon(status)}
                      <span className="ml-2">{status}</span>
                    </Button>
                  ))}
                </div>
                {updatingStatus && (
                  <p className="text-sm text-blue-600 mt-3 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Updating status...
                  </p>
                )}
              </div>

              {/* Tracking Number */}
              {selectedOrder.trackingNumber && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm font-medium">Tracking Number:</p>
                  <p className="text-lg font-mono">{selectedOrder.trackingNumber}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Confirmation Dialog */}
      <Dialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              Confirm Status Update
            </DialogTitle>
            <DialogClose onClick={() => setShowStatusConfirm(false)} />
          </DialogHeader>
          <div className="p-6 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to change the order status to{" "}
              <span className="font-bold capitalize text-blue-600">{pendingStatus}</span>?
            </p>
            {pendingStatus === "cancelled" && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400">
                  ⚠️ This action will cancel the order. Make sure to process any refunds if necessary.
                </p>
              </div>
            )}
            {pendingStatus === "delivered" && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-400">
                  ✓ This will mark the order as successfully delivered.
                </p>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={confirmStatusUpdate}
                disabled={updatingStatus}
                className="flex-1"
              >
                {updatingStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirm
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowStatusConfirm(false)}
                disabled={updatingStatus}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
