import React from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const DashboardHeader = ({
  title = "Dashboard",
  subtitle,
  user,
  onRefresh,
  onBack,
  showRefresh = true,
  showBack = false,
  children,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Section - Logo, Title, and Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Back Button */}
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors self-start sm:self-auto"
            >
              <ArrowBackIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Back</span>
            </button>
          )}

          {/* Logo and Title Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img
              src="/src/images/bias_logo.png"
              alt="Bias Clothing Logo"
              className="h-8 w-auto sm:h-10 lg:h-12"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                {title}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">
                {subtitle || `Welcome back, ${user?.name || "Administrator"}`}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Actions and Children */}
        <div className="flex items-center justify-end space-x-2 sm:space-x-4">
          {children}
          {showRefresh && onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-50"
            >
              <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm hidden sm:inline">
                Refresh
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
