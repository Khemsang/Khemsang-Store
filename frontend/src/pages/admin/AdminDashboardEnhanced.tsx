import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react";
import { formatCurrency } from "../../utils/constants";
import { exportAnalyticsToExcel } from "../../utils/excelExport";

import { Loading } from "../../components/ui/loading";

const AdminDashboardEnhanced = () => {
  const { error } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/stats/analytics");
      setAnalytics(res.data);
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analytics) {
      error("No data available to export");
      return;
    }

    const success = exportAnalyticsToExcel(analytics);
    if (success) {
      // Show success message (you can use toast here)
      console.log("Report downloaded successfully!");
    } else {
      error("Failed to download report");
    }
  };

  if (loading) {
    return <Loading message="Loading analytics..." variant="default" />;
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(analytics.totalRevenue || 0),
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-600",
      change: "+12.5%",
      changeType: "up",
      description: "From all paid orders",
    },
    {
      title: "Total Orders",
      value: analytics.totalOrders || 0,
      icon: ShoppingCart,
      gradient: "from-blue-500 to-cyan-600",
      change: "+8.2%",
      changeType: "up",
      description: "All time orders",
    },
    {
      title: "Total Products",
      value: analytics.totalProducts || 0,
      icon: Package,
      gradient: "from-orange-500 to-amber-600",
      change: "+3.1%",
      changeType: "up",
      description: "Active products",
    },
    {
      title: "Total Customers",
      value: analytics.totalCustomers || 0,
      icon: Users,
      gradient: "from-gray-600 to-gray-800",
      change: "+5.4%",
      changeType: "up",
      description: "Registered users",
    },
  ];

  const orderStatusData =
    analytics.ordersByStatus?.map((item: any) => {
      const colors: any = {
        pending: "#f59e0b",
        processing: "#3b82f6",
        shipped: "#8b5cf6",
        delivered: "#10b981",
        cancelled: "#ef4444",
      };
      return {
        name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        value: item.count,
        color: colors[item.status] || "#6b7280",
      };
    }) || [];

  const revenueData = analytics.monthlyRevenue || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Complete overview of your store performance
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Refresh
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-orange-600 text-white rounded-lg hover:from-blue-700 hover:to-orange-700 transition-all shadow-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                    {stat.value}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={stat.changeType === "up" ? "success" : "danger"}
                      className="flex items-center gap-1"
                    >
                      {stat.changeType === "up" ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {stat.description}
                    </span>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Last 6 months revenue performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Order Distribution</CardTitle>
            <CardDescription>Orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Bar Chart and Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Comparison</CardTitle>
            <CardDescription>Revenue by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <CardDescription>Month over month growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {orderStatusData.map((status: any, index: number) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/admin/orders")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {status.name}
                  </p>
                  <h3 className="text-2xl font-bold mt-1">{status.value}</h3>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: status.color + "20" }}
                >
                  {status.name === "Pending" && <Clock className="w-6 h-6" style={{ color: status.color }} />}
                  {status.name === "Processing" && <TrendingUp className="w-6 h-6" style={{ color: status.color }} />}
                  {status.name === "Shipped" && <Truck className="w-6 h-6" style={{ color: status.color }} />}
                  {status.name === "Delivered" && <CheckCircle className="w-6 h-6" style={{ color: status.color }} />}
                  {status.name === "Cancelled" && <AlertTriangle className="w-6 h-6" style={{ color: status.color }} />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      {analytics.recentOrders && analytics.recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from customers</CardDescription>
              </div>
              <button
                onClick={() => navigate("/admin/orders")}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentOrders.slice(0, 5).map((order: any) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => navigate("/admin/orders")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                      #{order._id.slice(-4)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Order #{order._id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <Badge
                      variant={
                        order.orderStatus === "delivered"
                          ? "success"
                          : order.orderStatus === "cancelled"
                          ? "danger"
                          : "info"
                      }
                    >
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboardEnhanced;
