import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import Unauthorized from "../views/Unauthorized";

const ProtectedRoute = ({ children }) => {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Only check auth if we don't already have user data
    if (!user) {
      checkUserAuth();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const checkUserAuth = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/user", {
        credentials: "include",
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to sign in to access this page.
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the protected component
  return children;
};

// Admin Protected Route Component
export const AdminProtectedRoute = ({ children }) => {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only check auth if we don't already have user data
    if (!user) {
      checkUserAuth();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const checkUserAuth = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/user", {
        credentials: "include",
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated or not an admin, show unauthorized page
  if (!user || user.role !== "ADMIN") {
    return <Unauthorized />;
  }

  // If user is authenticated and is an admin, render the protected component
  return children;
};

export default ProtectedRoute;
