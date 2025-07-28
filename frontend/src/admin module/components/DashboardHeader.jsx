import React from "react";
import SettingsIcon from "@mui/icons-material/Settings";

const DashboardHeader = ({
  title = "Dashboard",
  subtitle,
  user,
  onRefresh,
  showRefresh = true,
  children,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="/src/images/bias_logo.png"
            alt="Bias Clothing Logo"
            className="h-12 w-auto"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">
              {subtitle || `Welcome back, ${user?.name || "Administrator"}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {children}
          {showRefresh && onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <SettingsIcon className="h-6 w-6" />
              <span className="text-sm">Refresh</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
