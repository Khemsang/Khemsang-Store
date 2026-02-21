import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Label } from "../../ui/label";
import { Select } from "../../ui/select";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Package, Truck, CheckCircle, XCircle } from "lucide-react";

interface OrderFormProps {
  order: any;
  onUpdateStatus: (status: string) => void;
  loading?: boolean;
}

export const OrderForm = ({ order, onUpdateStatus, loading = false }: OrderFormProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Package className="w-5 h-5 text-yellow-500" />;
      case "processing":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "warning",
      processing: "info",
      shipped: "info",
      delivered: "success",
      cancelled: "danger",
    };
    return variants[status] || "default";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(order.orderStatus)}
          Order #{order._id?.slice(-6)}
        </CardTitle>
        <CardDescription>
          Update order status and manage delivery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Status</p>
            <p className="text-lg font-semibold mt-1">
              <Badge variant={getStatusBadge(order.orderStatus)}>
                {order.orderStatus?.toUpperCase()}
              </Badge>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Order Total</p>
            <p className="text-lg font-bold text-blue-600">
              Rs. {order.totalAmount?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-2">
          <Label>Customer Information</Label>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2">
            <p className="font-medium">{order.shippingAddress?.fullName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {order.shippingAddress?.phone}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {order.shippingAddress?.address}, {order.shippingAddress?.city}
            </p>
          </div>
        </div>

        {/* Update Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Update Order Status</Label>
          <Select
            id="status"
            defaultValue={order.orderStatus}
            onChange={(e) => onUpdateStatus(e.target.value)}
            disabled={loading}
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>

        {/* Status Timeline */}
        <div className="space-y-2">
          <Label>Order Timeline</Label>
          <div className="space-y-3">
            {["pending", "processing", "shipped", "delivered"].map((status, index) => {
              const isCompleted = ["pending", "processing", "shipped", "delivered"].indexOf(
                order.orderStatus
              ) >= index;
              const isCurrent = order.orderStatus === status;

              return (
                <div key={status} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    } ${isCurrent ? "ring-4 ring-green-200 dark:ring-green-900" : ""}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        isCompleted
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
