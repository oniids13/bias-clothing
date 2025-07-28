import React from "react";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";

const RecentActivity = ({
  activities = [],
  onRefresh,
  title = "Recent Activity",
  maxHeight = "max-h-96",
  showRefreshButton = true,
  formatCurrency = (amount) => `$${amount}`,
  emptyMessage = "No recent activity",
  emptySubMessage = "Activity will appear here as your business grows",
}) => {
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

  const getActivityIcon = (type) => {
    switch (type) {
      case "order":
        return <ShoppingCartIcon className="h-5 w-5 text-green-600" />;
      case "user":
        return <PeopleIcon className="h-5 w-5 text-blue-600" />;
      case "product":
        return <InventoryIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <BarChartIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityBgColor = (type) => {
    switch (type) {
      case "order":
        return "bg-green-100";
      case "user":
        return "bg-blue-100";
      case "product":
        return "bg-purple-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {showRefreshButton && onRefresh && (
          <button
            onClick={onRefresh}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      <div className={`space-y-4 ${maxHeight} overflow-y-auto`}>
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div
                className={`${getActivityBgColor(
                  activity.type
                )} p-2 rounded-full flex-shrink-0`}
              >
                {getActivityIcon(activity.type)}
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
            <p className="text-gray-500 font-medium">{emptyMessage}</p>
            <p className="text-gray-400 text-sm mt-1">{emptySubMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
