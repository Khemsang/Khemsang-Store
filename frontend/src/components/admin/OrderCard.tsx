import {
  formatCurrency,
  formatDate,
  getStatusColor,
} from "../../utils/constants";

interface Order {
  _id: string;
  user: { name: string; email: string };
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
}

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

const OrderCard = ({ order, onClick }: OrderCardProps) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
  >
    <div className="flex items-center gap-4 flex-1">
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
        #{order._id.slice(-4)}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900 dark:text-white">
          {order.user?.name || "Guest"}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(order.createdAt)}
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-bold text-gray-900 dark:text-white mb-1">
        {formatCurrency(order.totalAmount)}
      </p>
      <span
        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
          order.orderStatus
        )}`}
      >
        {order.orderStatus}
      </span>
    </div>
  </div>
);

export default OrderCard;
