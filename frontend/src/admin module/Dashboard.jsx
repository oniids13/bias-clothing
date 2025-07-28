import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { adminApi } from "../services/adminApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";
import { Line, Pie, Bar } from "react-chartjs-2";

// Material UI Icons
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const Dashboard = () => {
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
  const [chartData, setChartData] = useState({
    revenue: null,
    orders: null,
    users: null,
    categories: null,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch complete admin statistics with growth data and analytics
      const [completeStatsResult, activityResult, analyticsResult] =
        await Promise.all([
          adminApi.getCompleteAdminStats(),
          adminApi.getRecentActivity(10),
          adminApi.getDashboardAnalytics(),
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

      // Update chart data with real analytics
      if (analyticsResult.success) {
        generateChartDataFromAPI(analyticsResult.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateChartDataFromAPI = (analyticsData) => {
    // Revenue trend chart
    const revenueData = {
      labels: analyticsData.revenueTrend.labels,
      datasets: [
        {
          label: "Revenue (PHP)",
          data: analyticsData.revenueTrend.data,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
        },
      ],
    };

    // Order status distribution
    const ordersData = {
      labels: analyticsData.orderStatusDistribution.labels,
      datasets: [
        {
          data: analyticsData.orderStatusDistribution.data,
          backgroundColor: [
            "#10B981", // Green for completed
            "#F59E0B", // Yellow for processing
            "#3B82F6", // Blue for shipped
            "#8B5CF6", // Purple for confirmed
            "#EF4444", // Red for cancelled
            "#6B7280", // Gray for others
          ],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    };

    // User growth chart
    const usersData = {
      labels: analyticsData.userGrowth.labels,
      datasets: [
        {
          label: "New Users",
          data: analyticsData.userGrowth.data,
          backgroundColor: "rgba(139, 69, 19, 0.8)",
          borderColor: "rgba(139, 69, 19, 1)",
          borderWidth: 1,
        },
      ],
    };

    // Categories breakdown
    const categoriesData = {
      labels: analyticsData.salesByCategory.labels,
      datasets: [
        {
          label: "Sales by Category",
          data: analyticsData.salesByCategory.data,
          backgroundColor: [
            "#8B4513",
            "#D2691E",
            "#CD853F",
            "#DEB887",
            "#F5DEB3",
            "#BC8F8F",
          ],
          borderWidth: 1,
        },
      ],
    };

    setChartData({
      revenue: revenueData,
      orders: ordersData,
      users: usersData,
      categories: categoriesData,
    });
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

  const getGrowthIcon = (percentage) => {
    if (percentage > 0) return <TrendingUpIcon className="h-4 w-4" />;
    if (percentage < 0) return <TrendingDownIcon className="h-4 w-4" />;
    return null;
  };

  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Revenue Trend (Last 6 Months)",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "₱" + value.toLocaleString();
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Order Status Distribution",
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "User Growth (Monthly)",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const categoryPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Sales by Category",
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics dashboard...</p>
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
            onClick={fetchDashboardData}
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
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600">
                  View overall statistics and analytics -{" "}
                  {user?.name || "Administrator"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchDashboardData}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <SettingsIcon className="h-6 w-6" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.totalUsers)}
                </p>
              </div>
              <PeopleIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div
              className={`flex items-center mt-2 ${getGrowthColor(
                growthData.users
              )}`}
            >
              {getGrowthIcon(growthData.users)}
              <p className="text-xs ml-1">
                {formatGrowthPercentage(growthData.users)} from last month
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
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
            <div
              className={`flex items-center mt-2 ${getGrowthColor(
                growthData.products
              )}`}
            >
              {getGrowthIcon(growthData.products)}
              <p className="text-xs ml-1">
                {formatGrowthPercentage(growthData.products)} from last month
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
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
            <div
              className={`flex items-center mt-2 ${getGrowthColor(
                growthData.orders
              )}`}
            >
              {getGrowthIcon(growthData.orders)}
              <p className="text-xs ml-1">
                {formatGrowthPercentage(growthData.orders)} from last month
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <BarChartIcon className="h-8 w-8 text-green-500" />
            </div>
            <div
              className={`flex items-center mt-2 ${getGrowthColor(
                growthData.revenue
              )}`}
            >
              {getGrowthIcon(growthData.revenue)}
              <p className="text-xs ml-1">
                {formatGrowthPercentage(growthData.revenue)} from last month
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="h-80">
              {chartData.revenue ? (
                <Line data={chartData.revenue} options={lineChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading revenue data...</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="h-80">
              {chartData.orders ? (
                <Pie data={chartData.orders} options={pieChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading order data...</p>
                </div>
              )}
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="h-80">
              {chartData.users ? (
                <Bar data={chartData.users} options={barChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading user data...</p>
                </div>
              )}
            </div>
          </div>

          {/* Categories Breakdown */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="h-80">
              {chartData.categories ? (
                <Pie data={chartData.categories} options={categoryPieOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading category data...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Activity
            </h2>
            <button
              onClick={fetchDashboardData}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`${
                      activity.type === "order"
                        ? "bg-green-100"
                        : activity.type === "user"
                        ? "bg-blue-100"
                        : "bg-purple-100"
                    } p-2 rounded-full flex-shrink-0`}
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-relaxed">
                      {activity.message}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {formatActivityTime(activity.timestamp)}
                      </p>
                      {activity.type === "order" && activity.details?.total && (
                        <span className="text-xs font-medium text-green-600">
                          {formatCurrency(activity.details.total)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BarChartIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No recent activity</p>
                <p className="text-gray-400 text-sm mt-1">
                  Activity will appear here as your business grows
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
