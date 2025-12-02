import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import {
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaDollarSign,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaExclamationTriangle,
  FaTags,
} from "react-icons/fa";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockProducts: number;
  processingOrders: number;
  shippedOrders: number;
  totalCategories: number;
}

interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  items: Array<{
    product: {
      title: string;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const { error } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStockProducts: 0,
    processingOrders: 0,
    shippedOrders: 0,
    totalCategories: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch products
      const { data: products } = await api.get("/products");

      // Fetch orders
      const { data: orders } = await api.get("/orders");

      // Fetch categories
      const { data: categories } = await api.get("/categories");

      // Calculate stats
      const totalRevenue = orders.reduce(
        (sum: number, order: Order) => sum + (order.totalAmount || 0),
        0
      );

      const pendingOrders = orders.filter(
        (order: Order) => order.orderStatus === "pending"
      ).length;

      const processingOrders = orders.filter(
        (order: Order) => order.orderStatus === "processing"
      ).length;

      const shippedOrders = orders.filter(
        (order: Order) => order.orderStatus === "shipped"
      ).length;

      const completedOrders = orders.filter(
        (order: Order) => order.orderStatus === "delivered"
      ).length;

      const lowStock = products.filter((product: any) => product.stock < 10);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: 0,
        totalRevenue,
        pendingOrders,
        completedOrders,
        lowStockProducts: lowStock.length,
        processingOrders,
        shippedOrders,
        totalCategories: categories.length,
      });

      setRecentOrders(orders.slice(0, 5));
      setLowStockProducts(lowStock.slice(0, 5));
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: FaBox,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      link: "/admin/products",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: FaTags,
      gradient: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
      textColor: "text-pink-600 dark:text-pink-400",
      link: "/admin/categories",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: FaShoppingCart,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      link: "/admin/orders",
    },
    {
      title: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      icon: FaDollarSign,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: FaClock,
      gradient: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      textColor: "text-yellow-600 dark:text-yellow-400",
      link: "/admin/orders",
    },
    {
      title: "Processing",
      value: stats.processingOrders,
      icon: FaChartLine,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      link: "/admin/orders",
    },
    {
      title: "Shipped",
      value: stats.shippedOrders,
      icon: FaTruck,
      gradient: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      textColor: "text-indigo-600 dark:text-indigo-400",
      link: "/admin/orders",
    },
    {
      title: "Completed",
      value: stats.completedOrders,
      icon: FaCheckCircle,
      gradient: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockProducts,
      icon: FaExclamationTriangle,
      gradient: "from-red-500 to-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400",
      link: "/admin/products",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "processing":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "shipped":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

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
      <div className="bg-gradient-to-r from-[var(--root-color)] to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-white/90 text-lg">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => stat.link && navigate(stat.link)}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 ${
              stat.link ? "cursor-pointer hover:scale-105" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center`}
              >
                <stat.icon className={`text-2xl ${stat.textColor}`} />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              {stat.title}
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaShoppingCart className="mr-2 text-[var(--root-color)]" />
              Recent Orders
            </h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-[var(--root-color)] hover:underline text-sm font-medium"
            >
              View All →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <FaShoppingCart className="mx-auto text-5xl text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => navigate("/admin/orders")}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-r from-[var(--root-color)] to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      #{order._id.slice(-4)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {order.user?.name || "Guest"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white mb-1">
                      Rs. {order.totalAmount?.toLocaleString()}
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
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaExclamationTriangle className="mr-2 text-red-500" />
              Low Stock Alert
            </h2>
            <button
              onClick={() => navigate("/admin/products")}
              className="text-[var(--root-color)] hover:underline text-sm font-medium"
            >
              View All →
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-12">
              <FaCheckCircle className="mx-auto text-5xl text-green-300 dark:text-green-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                All products are well stocked!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={product.images?.[0] || "/placeholder.jpg"}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {product.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Stock
                    </p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                      {product.stock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => navigate("/admin/products")}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <FaBox className="text-4xl mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-2">Manage Products</h3>
          <p className="opacity-90 text-sm">
            Add, edit, or remove products from your inventory
          </p>
        </div>

        <div
          onClick={() => navigate("/admin/categories")}
          className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <FaTags className="text-4xl mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-2">Manage Categories</h3>
          <p className="opacity-90 text-sm">
            Create and organize product categories
          </p>
        </div>

        <div
          onClick={() => navigate("/admin/orders")}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <FaTruck className="text-4xl mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-2">Process Orders</h3>
          <p className="opacity-90 text-sm">
            View and update order status, manage deliveries
          </p>
        </div>

        <div
          onClick={() => navigate("/admin/products")}
          className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <FaChartLine className="text-4xl mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-2">View Analytics</h3>
          <p className="opacity-90 text-sm">
            Track sales, revenue, and performance metrics
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
