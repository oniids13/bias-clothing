import { Link } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import HomeIcon from "@mui/icons-material/Home";
import LoginIcon from "@mui/icons-material/Login";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <img
              src="/src/images/bias_logo.png"
              alt="Bias Clothing Logo"
              className="mx-auto h-16 w-auto"
            />
          </div>

          {/* Lock Icon */}
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
              <LockOutlinedIcon className="h-10 w-10 text-red-600" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 text-lg">
              You don't have permission to access this area
            </p>
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-gray-500 text-sm leading-relaxed">
              This section is restricted to administrators only. If you believe
              you should have access to this area, please contact support or try
              logging in with an administrator account.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Go Home Button */}
            <Link
              to="/"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go to Home
            </Link>

            {/* Go Back Button */}
            <button
              onClick={() => window.history.back()}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              <ArrowBackIcon className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
          <p className="text-xs text-gray-500 mb-3">
            If you're having trouble accessing admin features, here are some
            options:
          </p>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center justify-center space-x-1">
              <span>•</span>
              <span>Make sure you're logged in with an admin account</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <span>•</span>
              <span>Contact support if you need admin access</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <span>•</span>
              <span>Check if your session has expired</span>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <Link
            to="/shop"
            className="block text-sm text-blue-600 hover:text-blue-500 transition duration-200"
          >
            Continue Shopping
          </Link>
          <Link
            to="/about"
            className="block text-sm text-gray-500 hover:text-gray-700 transition duration-200"
          >
            Learn More About Bias Clothing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
