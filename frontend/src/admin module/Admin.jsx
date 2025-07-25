import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { adminApi } from "../services/adminApi";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";

const Admin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [growthData, setGrowthData] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  const adminFeatures = [
    {
      title: "Dashboard",
      description: "View overall statistics and analytics",
      icon: <DashboardIcon className="h-8 w-8" />,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
    },
    {
      title: "User Management",
      description: "Manage customer accounts and permissions",
      icon: <PeopleIcon className="h-8 w-8" />,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
    },
    {
      title: "Product Management",
      description: "Add, edit, and manage products",
      icon: <InventoryIcon className="h-8 w-8" />,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
    },
    {
      title: "Order Management",
      description: "View and process customer orders",
      icon: <ShoppingCartIcon className="h-8 w-8" />,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
    },
    {
      title: "Gallery Management",
      description: "Manage image gallery and media",
      icon: <PhotoLibraryIcon className="h-8 w-8" />,
      color: "bg-pink-500",
      hoverColor: "hover:bg-pink-600",
    },
    {
      title: "Analytics",
      description: "View detailed reports and insights",
      icon: <BarChartIcon className="h-8 w-8" />,
      color: "bg-indigo-500",
      hoverColor: "hover:bg-indigo-600",
    },
  ];

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch complete admin statistics with growth data
      const [completeStatsResult, activityResult] = await Promise.all([
        adminApi.getCompleteAdminStats(),
        adminApi.getRecentActivity(3),
      ]);

      if (completeStatsResult.success) {
        const data = completeStatsResult.data;

        // Update stats
        setStats({
          totalUsers: data.users.customers || 0,
          totalProducts: data.products.total || 0,
          totalOrders: data.orders.totalOrders || 0,
          totalRevenue: data.orders.totalRevenue || 0,
        });

        // Update growth data with real percentages
        setGrowthData({
          users: data.users.growthPercentage || 0,
          products: data.products.growthPercentage || 0,
          orders: data.orders.growthPercentage || 0,
          revenue: data.orders.revenueGrowthPercentage || 0,
        });
      }

      // Update recent activity
      if (activityResult.success) {
        setRecentActivity(activityResult.data);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setError("Failed to load admin data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatGrowthPercentage = (percentage) => {
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getGrowthColor = (percentage) => {
    if (percentage > 0) return "text-green-600";
    if (percentage < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-4">
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchAdminData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/src/images/bias_logo.png"
                alt="Bias Clothing Logo"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome back, {user?.name || "Administrator"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchAdminData}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <SettingsIcon className="h-6 w-6" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.totalUsers)}
                </p>
              </div>
              <PeopleIcon className="h-8 w-8 text-blue-500" />
            </div>
            <p className={`text-xs mt-2 ${getGrowthColor(growthData.users)}`}>
              {formatGrowthPercentage(growthData.users)} from last month
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.totalProducts)}
                </p>
              </div>
              <InventoryIcon className="h-8 w-8 text-purple-500" />
            </div>
            <p
              className={`text-xs mt-2 ${getGrowthColor(growthData.products)}`}
            >
              {formatGrowthPercentage(growthData.products)} from last month
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.totalOrders)}
                </p>
              </div>
              <ShoppingCartIcon className="h-8 w-8 text-orange-500" />
            </div>
            <p className={`text-xs mt-2 ${getGrowthColor(growthData.orders)}`}>
              {formatGrowthPercentage(growthData.orders)} from last month
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <BarChartIcon className="h-8 w-8 text-green-500" />
            </div>
            <p className={`text-xs mt-2 ${getGrowthColor(growthData.revenue)}`}>
              {formatGrowthPercentage(growthData.revenue)} from last month
            </p>
          </div>
        </div>

        {/* Admin Features Grid */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Administration Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminFeatures.map((feature, index) => (
              <div
                key={index}
                className="group cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-6 h-full hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div
                      className={`${feature.color} ${feature.hoverColor} text-white p-3 rounded-lg transition-colors group-hover:scale-110 transform duration-200`}
                    >
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                  <div className="mt-4 text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                    Manage →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`${
                      activity.type === "order"
                        ? "bg-green-100"
                        : activity.type === "user"
                        ? "bg-blue-100"
                        : "bg-purple-100"
                    } p-2 rounded-full`}
                  >
                    {activity.type === "order" && (
                      <ShoppingCartIcon className="h-5 w-5 text-green-600" />
                    )}
                    {activity.type === "user" && (
                      <PeopleIcon className="h-5 w-5 text-blue-600" />
                    )}
                    {activity.type === "product" && (
                      <InventoryIcon className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
