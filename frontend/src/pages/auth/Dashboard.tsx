import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaShoppingBag,
  FaHeart,
  FaBox,
  FaCheckCircle,
} from "react-icons/fa";

const Dashboard: React.FC = () => {
  const [data, setData] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/auth/dashboard`, {
      headers: { Authorization: token || "" },
    })
      .then((res) => res.json())
      .then((d) => setData(d.message))
      .catch(() => setData("Welcome to your dashboard!"));
  }, []);

  const stats = [
    {
      icon: FaShoppingBag,
      label: "Total Orders",
      value: "0",
      color: "blue-500",
    },
    {
      icon: FaBox,
      label: "Pending Orders",
      value: "0",
      color: "yellow-500",
    },
    {
      icon: FaCheckCircle,
      label: "Completed",
      value: "0",
      color: "green-500",
    },
    {
      icon: FaHeart,
      label: "Wishlist",
      value: "0",
      color: "red-500",
    },
  ];

  const quickActions = [
    {
      title: "Browse Products",
      description: "Explore our furniture collection",
      icon: FaBox,
      action: () => navigate("/products"),
      color: "purple-500",
    },
    {
      title: "View Cart",
      description: "Check your shopping cart",
      icon: FaShoppingBag,
      action: () => navigate("/cart"),
      color: "blue-500",
    },
    {
      title: "Contact Us",
      description: "Get in touch with support",
      icon: FaEnvelope,
      action: () => navigate("/contact"),
      color: "green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <FaEnvelope className="text-sm" />
                  {user?.email}
                </p>
                {user?.isVerified && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                    <FaCheckCircle />
                    Verified Account
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300 p-6 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 bg-${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}
                >
                  <stat.icon className="text-xl" />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300 p-6 text-left group"
              >
                <div
                  className={`w-14 h-14 bg-${action.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <action.icon className="text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBox className="text-3xl text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No recent activity yet
            </p>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
