import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useMinimumLoading } from "../../hooks/useMinimumLoading";
import { useScrollToTop } from "../../hooks/useScrollToTop";
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
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumLoading(loading, 1000);
  const [tabLoading, setTabLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  

  useScrollToTop(currentPage);
  
  const [itemsPerPage] = useState(10);
  const { success, error } = useToast();

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    filterOrders(activeTab);
    setCurrentPage(1);
  }, [activeTab, allOrders]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders");
      

      const uniqueOrders = data.filter((order: Order, index: number, self: Order[]) =>
        index === self.findIndex((o) => o._id === order._id)
      );
      
      setAllOrders(uniqueOrders);
    } catch (err) {
      error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (status: string) => {
    if (status === "all") {
      setOrders(allOrders);
    } else {
      setOrders(allOrders.filter(order => order.orderStatus === status));
    }
  };

  const markAsRead = async (orderId: string) => {
    try {
      await api.put(`/orders/${orderId}/mark-read`);

      setAllOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, isRead: true } : order
        )
      );
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
      

      setShowStatusConfirm(false);
      setPendingStatus("");
      setSelectedOrder(null);
      

      await fetchAllOrders();
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


  const calculateRevenue = () => {
    const paidOrders = allOrders.filter((o) => o.paymentStatus === "paid");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const unreadCount = allOrders.filter((o) => !o.isRead).length;
    
    const revenueByStatus = {
      pending: allOrders
        .filter((o) => o.orderStatus === "pending" && o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.totalAmount, 0),
      processing: allOrders
        .filter((o) => o.orderStatus === "processing" && o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.totalAmount, 0),
      shipped: allOrders
        .filter((o) => o.orderStatus === "shipped" && o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.totalAmount, 0),
      delivered: allOrders
        .filter((o) => o.orderStatus === "delivered" && o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };

    return { totalRevenue, paidOrders: paidOrders.length, revenueByStatus, unreadCount };
  };

  const revenue = calculateRevenue();


  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

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

  if (showLoading) return <Loading message="Loading orders..." variant="delivery" fullScreen={true} />;

  return (
    <div className="p-6 space-y-6 bg-gray-900 h-full">
      
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
                <p className="text-2xl font-bold">{allOrders.length}</p>
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
                  {allOrders.filter((o) => o.orderStatus === "shipped").length}
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
                  {allOrders.filter((o) => o.orderStatus === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      
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
              
              <div className="space-y-4 mt-6">
                {currentOrders.map((order) => (
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

              
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            size="sm"
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
              
              {orders.length > 0 && (
                <div className="text-center text-sm text-gray-500 mt-4">
                  Showing {startIndex + 1} to {Math.min(endIndex, orders.length)} of {orders.length} orders
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Order #{selectedOrder?._id.slice(-8)}
              <span className="text-sm text-gray-500 ml-2">
                {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString()}
              </span>
            </DialogTitle>
            <DialogClose onClick={() => setSelectedOrder(null)} />
          </DialogHeader>

          {selectedOrder && (
            <div className="p-6 space-y-6">
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusVariant(selectedOrder.orderStatus)} className="text-lg px-4 py-2">
                      {getStatusIcon(selectedOrder.orderStatus)}
                      <span className="ml-2 capitalize font-bold">{selectedOrder.orderStatus}</span>
                    </Badge>
                    <Badge
                      variant={selectedOrder.paymentStatus === "paid" ? "success" : "warning"}
                      className="text-lg px-4 py-2"
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      {selectedOrder.paymentStatus}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                    <p className="text-lg font-bold capitalize">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>
              </div>

              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-lg border-2 border-green-200 dark:border-green-700">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Mail className="w-6 h-6" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase mb-1">Customer Name</p>
                    <p className="text-lg font-bold">{selectedOrder.user?.name || "N/A"}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase mb-1">Email</p>
                    <p className="text-lg font-semibold">{selectedOrder.user?.email || "N/A"}</p>
                  </div>
                </div>
              </div>

              
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-5 rounded-lg border-2 border-orange-200 dark:border-orange-700">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <MapPin className="w-6 h-6" />
                  Shipping Address
                </h3>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Recipient Name</p>
                      <p className="text-lg font-bold">{selectedOrder.shippingAddress?.fullName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Phone Number</p>
                      <p className="text-lg font-bold flex items-center gap-2">
                        <Phone className="w-5 h-5 text-orange-600" />
                        {selectedOrder.shippingAddress?.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.shippingAddress?.email && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Email</p>
                      <p className="text-base font-semibold">{selectedOrder.shippingAddress.email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Full Address</p>
                    <p className="text-base font-semibold">{selectedOrder.shippingAddress?.address || "N/A"}</p>
                    <p className="text-base font-semibold mt-1">
                      {selectedOrder.shippingAddress?.city || "N/A"}
                      {selectedOrder.shippingAddress?.postalCode &&
                        ` - ${selectedOrder.shippingAddress.postalCode}`}
                    </p>
                  </div>
                </div>
              </div>

              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-lg border-2 border-purple-200 dark:border-purple-700">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <ShoppingBag className="w-6 h-6" />
                  Order Items ({selectedOrder.items?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-100 dark:border-purple-800"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-lg font-bold mb-2">{item.product?.title || "Product"}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                <span className="text-sm font-semibold">Quantity: {item.quantity}</span>
                              </div>
                              <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                <span className="text-sm font-semibold">Price: {formatCurrency(item.price)}</span>
                              </div>
                              {item.colorVariant && (
                                <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full flex items-center gap-2">
                                  <span className="text-sm font-semibold">Color: {item.colorVariant.colorName}</span>
                                  <div
                                    className="w-5 h-5 rounded-full border-2 border-white shadow-md"
                                    style={{ backgroundColor: item.colorVariant.colorCode }}
                                    title={item.colorVariant.colorName}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 uppercase mb-1">Subtotal</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              
              <div className="bg-gray-100 dark:from-gray-800 dark:to-gray-900 p-5 rounded-lg border-2 border-gray-300 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        selectedOrder.totalAmount + (selectedOrder.discount || 0)
                      )}
                    </span>
                  </div>
                  {selectedOrder.discount && selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-base text-green-600">
                      <span className="font-medium">Discount Applied:</span>
                      <span className="font-bold">-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  {selectedOrder.couponCode && (
                    <div className="flex justify-between text-sm text-blue-600">
                      <span className="font-medium">Coupon Code:</span>
                      <span className="font-mono font-bold">{selectedOrder.couponCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold pt-3 border-t-2 border-gray-300 dark:border-gray-600">
                    <span>Total Amount:</span>
                    <span className="text-green-600">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              
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

              
              {selectedOrder.trackingNumber && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                  <p className="text-sm font-medium mb-2">Tracking Number:</p>
                  <p className="text-xl font-mono font-bold">{selectedOrder.trackingNumber}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      
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
