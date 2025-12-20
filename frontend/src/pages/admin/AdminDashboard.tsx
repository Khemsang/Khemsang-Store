import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  FaBox,
  FaShoppingCart,
  FaDollarSign,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaExclamationTriangle,
  FaTags,
} from "react-icons/fa";
import StatCard from "../../components/admin/StatCard";
import OrderCard from "../../components/admin/OrderCard";
import LowStockCard from "../../components/admin/LowStockCard";
import QuickActionCard from "../../components/admin/QuickActionCard";
import { formatCurrency } from "../../utils/constants";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockProducts: number;
  processingOrders: number;
  shippedOrders: number;
  totalCategories: number;
}

const AdminDashboard = () => {
  const { error } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStockProducts: 0,
    processingOrders: 0,
    shippedOrders: 0,
    totalCategories: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // adminOnly=true filters data to show only current admin's data
      const [productsRes, ordersRes, categoriesRes] = await Promise.all([
        api.get("/products?adminOnly=true"),
        api.get("/orders"),
        api.get("/categories?adminOnly=true"),
      ]);

      const products = productsRes.data;
      const orders = ordersRes.data;
      const categories = categoriesRes.data;

      // Calculate stats
      const totalRevenue = orders.reduce(
        (sum: number, order: any) => sum + (order.totalAmount || 0),
        0
      );
      const lowStock = products.filter((p: any) => p.stock < 10);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders: orders.filter((o: any) => o.orderStatus === "pending")
          .length,
        processingOrders: orders.filter(
          (o: any) => o.orderStatus === "processing"
        ).length,
        shippedOrders: orders.filter((o: any) => o.orderStatus === "shipped")
          .length,
        completedOrders: orders.filter(
          (o: any) => o.orderStatus === "delivered"
        ).length,
        lowStockProducts: lowStock.length,
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
      value: formatCurrency(stats.totalRevenue),
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

  const quickActions = [
    {
      title: "Manage Products",
      description: "Add, edit, or remove products from your inventory",
      icon: FaBox,
      gradient: "from-blue-500 to-blue-600",
      link: "/admin/products",
    },
    {
      title: "Manage Categories",
      description: "Create and organize product categories",
      icon: FaTags,
      gradient: "from-pink-500 to-rose-600",
      link: "/admin/categories",
    },
    {
      title: "Process Orders",
      description: "View and update order status, manage deliveries",
      icon: FaTruck,
      gradient: "from-emerald-500 to-teal-600",
      link: "/admin/orders",
    },
  ];

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
      <div className="bg-gradient-to-r from-[var(--root-color)] to-purple-600 rounded-2xl p-4 md:p-8 text-white shadow-xl">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">
          Dashboard Overview
        </h1>
        <p className="text-white/90 text-sm md:text-lg">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            {...stat}
            onClick={() => stat.link && navigate(stat.link)}
          />
        ))}
      </div>

      {/* Recent Orders & Low Stock */}
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
                <OrderCard
                  key={order._id}
                  order={order}
                  onClick={() => navigate("/admin/orders")}
                />
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
                <LowStockCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <QuickActionCard
            key={index}
            {...action}
            onClick={() => navigate(action.link)}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
