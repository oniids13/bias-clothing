import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { cartApi } from "../services/cartApi";

import LogoCover from "./LogoCover";

const Header = ({ user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    checkUserAuth();

    // Re-check authentication when page becomes visible (handles back button)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkUserAuth();
      }
    };

    // Re-check authentication when window gains focus
    const handleWindowFocus = () => {
      checkUserAuth();
    };

    // Re-check authentication on page show (handles back/forward navigation)
    const handlePageShow = (event) => {
      // If page was loaded from cache (back button), re-check auth
      if (event.persisted) {
        checkUserAuth();
      }
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("pageshow", handlePageShow);

    // Cleanup event listeners
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [setUser]);

  // Fetch cart item count when user changes
  useEffect(() => {
    if (user) {
      fetchCartItemCount();
      // Set up interval to refresh cart count periodically
      const interval = setInterval(fetchCartItemCount, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    } else {
      setCartItemCount(0);
    }
  }, [user]);

  const checkUserAuth = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/user", {
        credentials: "include",
        cache: "no-cache", // Prevent caching
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
      console.error("Error checking user authentication:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCartItemCount = async () => {
    if (!user) return;

    try {
      const response = await cartApi.getCartItemCount();
      if (response.success) {
        setCartItemCount(response.count || 0);
      } else {
        console.error("Failed to fetch cart count:", response.message);
        setCartItemCount(0);
      }
    } catch (error) {
      console.error("Error fetching cart item count:", error);
      // Don't reset to 0 on error, keep current count
    }
  };

  const logInPage = () => {
    navigate("/login");
  };

  const googleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (response.ok) {
        setUser(null);
        setCartItemCount(0);
        closeMenu();
        // Force a re-check of authentication status after logout
        setTimeout(() => {
          checkUserAuth();
        }, 100);
        navigate("/");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const CartIconWithBadge = ({ className = "", fontSize = "medium" }) => (
    <div className={`relative inline-block ${className}`}>
      <ShoppingCartIcon fontSize={fontSize} />
      {cartItemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold text-[10px] px-1">
          {cartItemCount > 99 ? "99+" : cartItemCount}
        </span>
      )}
    </div>
  );

  // Function to refresh cart count (can be called from other components)
  window.refreshCartCount = fetchCartItemCount;

  return (
    <>
      <header className="p-10 relative">
        <div className="flex justify-between items-center">
          <Link to="/">
            <img className="w-30" src="/src/images/bias_logo.png" alt="logo" />
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex gap-10 font-bold">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/shop">Shop</Link>
          </div>

          {/* Desktop Cart and User - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/cart" className="inline-block">
              <CartIconWithBadge />
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="inline-block"
                  title={`Profile - ${user.name}`}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <AccountCircleIcon />
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm hover:text-gray-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <button onClick={logInPage} disabled={isLoading}>
                <AccountCircleIcon />
              </button>
            )}
          </div>

          {/* Hamburger Menu Button - Visible on mobile */}
          <button
            onClick={toggleMenu}
            className="md:hidden z-50 relative"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Small Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-full right-4 bg-white shadow-lg border rounded-lg md:hidden z-40 w-48">
            <nav className="flex flex-col p-3 space-y-2">
              <Link
                to="/"
                onClick={closeMenu}
                className="font-bold hover:text-gray-600 transition-colors py-2 px-3 rounded hover:bg-gray-100"
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={closeMenu}
                className="font-bold hover:text-gray-600 transition-colors py-2 px-3 rounded hover:bg-gray-100"
              >
                About
              </Link>
              <Link
                to="/shop"
                onClick={closeMenu}
                className="font-bold hover:text-gray-600 transition-colors py-2 px-3 rounded hover:bg-gray-100"
              >
                Shop
              </Link>
              <hr className="my-1" />
              <Link
                to="/cart"
                onClick={closeMenu}
                className="font-bold hover:text-gray-600 transition-colors flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100"
              >
                <CartIconWithBadge fontSize="small" />
                Cart
              </Link>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="font-bold hover:text-gray-600 transition-colors flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <AccountCircleIcon fontSize="small" />
                    )}
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="font-bold hover:text-gray-600 transition-colors text-left py-2 px-3 rounded hover:bg-gray-100 w-full"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={googleLogin}
                  disabled={isLoading}
                  className="font-bold hover:text-gray-600 transition-colors flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100 w-full text-left"
                >
                  <AccountCircleIcon fontSize="small" />
                  {isLoading ? "Loading..." : "Login"}
                </button>
              )}
            </nav>
          </div>
        )}
      </header>
      <LogoCover />
    </>
  );
};

export default Header;
