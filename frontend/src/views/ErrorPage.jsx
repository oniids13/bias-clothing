import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);

  // Auto redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="mx-auto w-64 h-64 relative">
            {/* 404 Text with modern styling */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl md:text-9xl font-bold text-gray-200 select-none">
                404
              </span>
            </div>

            {/* Floating elements */}
            <div className="absolute top-4 right-8 w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="absolute top-12 left-8 w-3 h-3 bg-red-500 rounded-full animate-bounce delay-200"></div>
            <div className="absolute bottom-8 right-12 w-5 h-5 bg-yellow-500 rounded-full animate-bounce delay-300"></div>
            <div className="absolute bottom-4 left-12 w-2 h-2 bg-green-500 rounded-full animate-bounce delay-400"></div>

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center z-10">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Oops! Page Not Found
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved to a
              different location.
            </p>
          </div>

          {/* Current path info */}
          {location.pathname !== "/" && (
            <div className="bg-gray-100 rounded-lg p-4 mx-auto max-w-md">
              <p className="text-sm text-gray-500 mb-1">You tried to visit:</p>
              <code className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded font-mono">
                {location.pathname}
              </code>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGoHome}
              className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2 group"
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go to Homepage
            </button>

            <button
              onClick={handleGoBack}
              className="bg-white text-gray-700 px-8 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go Back
            </button>

            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Page
            </button>
          </div>

          {/* Auto redirect notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-auto max-w-md">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="text-sm font-medium">
                Redirecting to homepage in {countdown} seconds...
              </span>
            </div>
          </div>

          {/* Helpful links */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-4">You might be looking for:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/shop")}
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
              >
                Shop
              </button>
              <button
                onClick={() => navigate("/about")}
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
              >
                About Us
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
              >
                Cart
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
              >
                Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
