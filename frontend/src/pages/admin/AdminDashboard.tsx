import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useMinimumLoading } from "../../hooks/useMinimumLoading";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Download,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "../../utils/constants";
import { exportAnalyticsToExcel } from "../../utils/excelExport";
import { Loading } from "../../components/ui/loading";

const AdminDashboard = () => {
  const { error } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumLoading(loading, 1000);
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

  if (showLoading) return <Loading message="Loading analytics..." fullScreen={true} />;
  if (!analytics) return <div className="p-8 text-center text-gray-500">No data available</div>;

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(analytics.totalRevenue || 0),
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      change: "+12.5%",
      description: analytics.adminRole === "Super Admin" ? "All orders" : "Your products",
    },
    {
      title: "Total Orders",
      value: analytics.totalOrders || 0,
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-600",
      change: "+8.2%",
      description: analytics.adminRole === "Super Admin" ? "All orders" : "Orders with your products",
    },
    {
      title: "Products",
      value: analytics.totalProducts || 0,
      icon: Package,
      color: "from-orange-500 to-amber-600",
      change: "+3.1%",
      description: analytics.adminRole === "Super Admin" ? "All products" : "Your products",
    },
    {
      title: "Customers",
      value: analytics.totalCustomers || 0,
      icon: Users,
      color: "from-gray-600 to-gray-800",
      change: "+5.4%",
      description: "Total customers",
    },
  ];

  const orderStatusData = analytics.ordersByStatus?.map((item: any) => {
    const colors: Record<string, string> = {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 md:py-8 lg:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 md:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                {analytics.adminRole && (
                  <Badge variant={analytics.adminRole === "Super Admin" ? "success" : "info"}>
                    {analytics.adminRole}
                  </Badge>
                )}
              </div>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                {analytics.adminRole === "Super Admin" 
                  ? "Complete system overview" 
                  : "Your products and orders overview"}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={fetchAnalytics} className="flex-1 sm:flex-none">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => exportAnalyticsToExcel(analytics)} className="flex-1 sm:flex-none">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                      <h3 className="text-xl md:text-2xl font-bold mt-2">{stat.value}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="success" className="text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {stat.change}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
                    </div>
                    <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                      <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Daily Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Daily Revenue (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <AreaChart data={analytics.dailyRevenue || []}>
                    <defs>
                      <linearGradient id="dailyRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          return payload[0].payload.date;
                        }
                        return label;
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#dailyRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Weekly Revenue (Last 7 Weeks)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <BarChart data={analytics.weeklyRevenue || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          return `${payload[0].payload.week} (${payload[0].payload.date})`;
                        }
                        return label;
                      }}
                    />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <AreaChart data={analytics.monthlyRevenue || []}>
                    <defs>
                      <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <BarChart data={orderStatusData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                    <Tooltip 
                      formatter={(value: any) => [`${value} orders`, 'Count']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {orderStatusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                
                {/* Legend with totals */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    {orderStatusData.map((item: any, index: number) => {
                      const total = orderStatusData.reduce((sum: number, i: any) => sum + i.value, 0);
                      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                      
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {item.name}: <span className="font-semibold">{item.value}</span> ({percentage}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentOrders?.slice(0, 5).map((order: any) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => navigate("/admin/orders")}
                    >
                      <div>
                        <p className="font-medium text-sm md:text-base">#{order._id.slice(-6)}</p>
                        <p className="text-xs md:text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm md:text-base">{formatCurrency(order.totalAmount)}</p>
                        <Badge variant={order.orderStatus === "delivered" ? "success" : "info"} className="text-xs">
                          {order.orderStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
