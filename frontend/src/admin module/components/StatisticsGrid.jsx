import React from "react";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

const StatisticsGrid = ({
  stats = {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  },
  growthData = {
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  },
  formatCurrency = (amount) => `$${amount}`,
  formatNumber = (num) => num.toString(),
  showGrowth = true,
}) => {
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

  const statisticsConfig = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: PeopleIcon,
      iconColor: "text-blue-500",
      growth: growthData.users,
      formatter: formatNumber,
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: InventoryIcon,
      iconColor: "text-purple-500",
      growth: growthData.products,
      formatter: formatNumber,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCartIcon,
      iconColor: "text-orange-500",
      growth: growthData.orders,
      formatter: formatNumber,
    },
    {
      title: "Revenue",
      value: stats.totalRevenue,
      icon: BarChartIcon,
      iconColor: "text-green-500",
      growth: growthData.revenue,
      formatter: formatCurrency,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statisticsConfig.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.formatter(stat.value)}
                </p>
              </div>
              <IconComponent className={`h-8 w-8 ${stat.iconColor}`} />
            </div>
            {showGrowth && (
              <div
                className={`flex items-center mt-2 ${getGrowthColor(
                  stat.growth
                )}`}
              >
                {getGrowthIcon(stat.growth)}
                <p className="text-xs ml-1">
                  {formatGrowthPercentage(stat.growth)} from last month
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatisticsGrid;
