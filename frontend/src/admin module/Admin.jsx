import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { adminApi } from "../services/adminApi";
import { useNavigate } from "react-router-dom";

// Reusable Components
import { DashboardHeader, StatisticsGrid, RecentActivity } from "./components";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import AnalyticsIcon from "@mui/icons-material/Analytics";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      title: "Product Management",
      description: "Add, edit, and manage product catalog",
      icon: <InventoryIcon className="h-8 w-8" />,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      onClick: () => navigate("/admin/products"),
    },
    {
      title: "Inventory Management",
      description: "Track stock levels and manage inventory",
      icon: <WarehouseIcon className="h-8 w-8" />,
      color: "bg-yellow-500",
      hoverColor: "hover:bg-yellow-600",
      onClick: () => navigate("/admin/inventory"),
    },
    {
      title: "Order Management",
      description: "View and process customer orders",
      icon: <ShoppingCartIcon className="h-8 w-8" />,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
    },
    {
      title: "Customer Management",
      description: "Manage customer accounts and information",
      icon: <PeopleIcon className="h-8 w-8" />,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
    },
    {
      title: "Sales Analytics",
      description: "View detailed sales reports and insights",
      icon: <AnalyticsIcon className="h-8 w-8" />,
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
        {/* Admin Dashboard Header */}
        <DashboardHeader
          title="Admin Dashboard"
          user={user}
          onRefresh={fetchAdminData}
        />

        {/* Quick Stats */}
        <StatisticsGrid
          stats={stats}
          growthData={growthData}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          showGrowth={true}
        />

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
                onClick={feature.onClick}
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
        <RecentActivity
          activities={recentActivity}
          onRefresh={fetchAdminData}
          title="Recent Activity"
          maxHeight=""
          formatCurrency={formatCurrency}
          emptyMessage="No recent activity"
          emptySubMessage="Activity will appear here as your business grows"
        />
      </div>
    </div>
  );
};

export default Admin;
