import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../services/adminApi";

// Reusable Components
import { DashboardHeader } from "./components";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AssessmentIcon from "@mui/icons-material/Assessment";

const SalesAnalytics = () => {
  const navigate = useNavigate();

  const [analyticsData, setAnalyticsData] = useState({
    period: "monthly",
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    dailySales: [],
    topProducts: [],
    topCategories: [],
    topCustomers: [],
    topLocations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  // Success/notification states
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchSalesAnalytics();
  }, [selectedPeriod]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchSalesAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApi.getSalesAnalytics(selectedPeriod);

      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("Failed to fetch sales analytics");
      console.error("Error fetching sales analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case "daily":
        return "Today";
      case "weekly":
        return "This Week";
      case "monthly":
        return "This Month";
      case "yearly":
        return "This Year";
      default:
        return "This Month";
    }
  };

  const getRevenueChange = () => {
    if (analyticsData.dailySales.length < 2) return 0;

    const recent = analyticsData.dailySales.slice(-1)[0]?.revenue || 0;
    const previous = analyticsData.dailySales.slice(-2, -1)[0]?.revenue || 0;

    if (previous === 0) return 0;
    return ((recent - previous) / previous) * 100;
  };

  const getOrdersChange = () => {
    if (analyticsData.dailySales.length < 2) return 0;

    const recent = analyticsData.dailySales.slice(-1)[0]?.orders || 0;
    const previous = analyticsData.dailySales.slice(-2, -1)[0]?.orders || 0;

    if (previous === 0) return 0;
    return ((recent - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <DashboardHeader
          title="Sales Analytics"
          subtitle={`${getPeriodLabel(selectedPeriod)} Sales Overview`}
          user="Admin"
          onRefresh={fetchSalesAnalytics}
          onBack={() => navigate("/admin")}
          showBack={true}
        />

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {error}
          </div>
        )}

        {/* Period Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FilterListIcon className="text-gray-600" />
              <span className="text-lg font-semibold text-gray-700">
                Time Period
              </span>
            </div>
            <div className="flex space-x-2">
              {["daily", "weekly", "monthly", "yearly"].map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPeriod === period
                      ? "bg-red-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analyticsData.totalRevenue)}
                </p>
                <div className="flex items-center mt-2">
                  {getRevenueChange() >= 0 ? (
                    <TrendingUpIcon className="text-green-500 text-sm" />
                  ) : (
                    <TrendingDownIcon className="text-red-500 text-sm" />
                  )}
                  <span
                    className={`text-sm font-medium ml-1 ${
                      getRevenueChange() >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {Math.abs(getRevenueChange()).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AttachMoneyIcon className="text-red-500 text-2xl" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.totalOrders}
                </p>
                <div className="flex items-center mt-2">
                  {getOrdersChange() >= 0 ? (
                    <TrendingUpIcon className="text-green-500 text-sm" />
                  ) : (
                    <TrendingDownIcon className="text-red-500 text-sm" />
                  )}
                  <span
                    className={`text-sm font-medium ml-1 ${
                      getOrdersChange() >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {Math.abs(getOrdersChange()).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingCartIcon className="text-blue-500 text-2xl" />
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Order Value
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analyticsData.averageOrderValue)}
                </p>
                <p className="text-sm text-gray-500 mt-2">Per order</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <AssessmentIcon className="text-green-500 text-2xl" />
              </div>
            </div>
          </div>

          {/* Period Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Period</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getPeriodLabel(selectedPeriod)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {analyticsData.dailySales.length} data points
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <CalendarTodayIcon className="text-purple-500 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue Trend
            </h3>
            {analyticsData.dailySales.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.dailySales.map((sale, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium text-gray-700">
                        {formatDate(sale.date)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(sale.revenue)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {sale.orders} orders
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No sales data available for this period
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Selling Products
            </h3>
            {analyticsData.topProducts.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.topProducts.slice(0, 5).map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(product.revenue)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.quantity} sold
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No product sales data available
              </div>
            )}
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Customers
            </h3>
            {analyticsData.topCustomers.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.topCustomers
                  .slice(0, 5)
                  .map((customer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {customer.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(customer.totalSpent)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {customer.orderCount} orders
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No customer data available
              </div>
            )}
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Locations
            </h3>
            {analyticsData.topLocations.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.topLocations
                  .slice(0, 5)
                  .map((location, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {location.city}
                          </p>
                          <p className="text-sm text-gray-500">
                            {location.state}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(location.totalRevenue)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {location.orderCount} orders
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No location data available
              </div>
            )}
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sales by Category
            </h3>
            {analyticsData.topCategories.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.topCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">
                        {category.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(category.revenue)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {category.quantity} items
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No category sales data available
              </div>
            )}
          </div>

          {/* Detailed Analytics Table */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detailed Analytics
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.totalOrders}
                  </p>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analyticsData.totalRevenue)}
                  </p>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analyticsData.averageOrderValue)}
                  </p>
                  <p className="text-sm text-gray-500">Avg Order Value</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.dailySales.length}
                  </p>
                  <p className="text-sm text-gray-500">Data Points</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchSalesAnalytics}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshIcon />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
