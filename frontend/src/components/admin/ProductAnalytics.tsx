import { useState, useEffect } from "react";
import { api } from "../../services/api";
import {
  FaBox,
  FaChartLine,
  FaDollarSign,
  FaShoppingCart,
} from "react-icons/fa";

interface Analytics {
  totalProducts: number;
  totalRevenue: number;
  totalOrders: number;
  topProducts: any[];
  recentOrders: any[];
}

// Stat Card Component
const StatCard = ({ icon: Icon, value, label, gradient }: any) => (
  <div
    className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-xl`}
  >
    <div className="flex items-center justify-between mb-4">
      <Icon className="text-4xl opacity-80" />
      <span className="text-3xl font-bold">{value}</span>
    </div>
    <p className="font-semibold opacity-90">{label}</p>
  </div>
);

// Top Product Item Component
const TopProductItem = ({ product, index }: any) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
    <div className="flex items-center gap-4">
      <span className="text-2xl font-bold text-purple-600">#{index + 1}</span>
      <div>
        <p className="font-semibold text-gray-800 dark:text-white">
          {product.name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sales: {product.sales || 0}
        </p>
      </div>
    </div>
    <span className="text-lg font-bold text-green-600">${product.price}</span>
  </div>
);

const ProductAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get("/admin/analytics");
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading analytics...</div>;

  const avgOrderValue = analytics?.totalOrders
    ? Math.round(analytics.totalRevenue / analytics.totalOrders)
    : 0;

  const stats = [
    {
      icon: FaBox,
      value: analytics?.totalProducts || 0,
      label: "Total Products",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: FaDollarSign,
      value: `$${analytics?.totalRevenue || 0}`,
      label: "Total Revenue",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: FaShoppingCart,
      value: analytics?.totalOrders || 0,
      label: "Total Orders",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: FaChartLine,
      value: avgOrderValue,
      label: "Avg Order Value",
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Top Products */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-purple-600" />
          Top Selling Products
        </h3>
        <div className="space-y-3">
          {analytics?.topProducts?.map((product, index) => (
            <TopProductItem key={product._id} product={product} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductAnalytics;
