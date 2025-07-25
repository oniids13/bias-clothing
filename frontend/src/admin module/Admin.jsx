import { useAuth } from "../App";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";

const Admin = () => {
  const { user } = useAuth();

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
              <SettingsIcon className="h-6 w-6 text-gray-500" />
              <span className="text-sm text-gray-500">Settings</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
              <PeopleIcon className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">+12% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
              <InventoryIcon className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">+5% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">2,468</p>
              </div>
              <ShoppingCartIcon className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">+18% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₱124,567</p>
              </div>
              <BarChartIcon className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">+23% from last month</p>
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
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-full">
                <ShoppingCartIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New order #ORD-2024-001 received
                </p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <PeopleIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New customer registration
                </p>
                <p className="text-xs text-gray-500">5 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-purple-100 p-2 rounded-full">
                <InventoryIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Product inventory updated
                </p>
                <p className="text-xs text-gray-500">10 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
