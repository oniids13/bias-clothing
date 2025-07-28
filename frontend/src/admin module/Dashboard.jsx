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

// Reusable Components
import { DashboardHeader, StatisticsGrid, RecentActivity } from "./components";

// Material UI Icons
import BarChartIcon from "@mui/icons-material/BarChart";

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
        {/* Dashboard Header */}
        <DashboardHeader
          title="Analytics Dashboard"
          subtitle={`View overall statistics and analytics - ${
            user?.name || "Administrator"
          }`}
          user={user}
          onRefresh={fetchDashboardData}
        />

        {/* Key Statistics */}
        <StatisticsGrid
          stats={stats}
          growthData={growthData}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          showGrowth={true}
        />

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
        <RecentActivity
          activities={recentActivity}
          onRefresh={fetchDashboardData}
          title="Recent Activity"
          maxHeight="max-h-96"
          formatCurrency={formatCurrency}
          emptyMessage="No recent activity"
          emptySubMessage="Activity will appear here as your business grows"
        />
      </div>
    </div>
  );
};

export default Dashboard;
