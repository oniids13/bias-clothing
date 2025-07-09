import Header from "./components/Header";
import Footer from "./components/Footer";
import { Outlet, useLocation } from "react-router-dom";
import { useState, createContext, useContext, useEffect } from "react";

// Create authentication context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Check for Google OAuth callback
  useEffect(() => {
    const checkGoogleAuthCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      if (urlParams.get("auth") === "success") {
        // Clear the URL parameter
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // Check authentication status after Google OAuth
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
          }
        } catch (error) {
          console.error("Error checking Google OAuth authentication:", error);
        }
      }
    };

    checkGoogleAuthCallback();
  }, [location]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <div className="wrapper">
        <Header user={user} setUser={setUser} />
        <div className="main">
          <Outlet />
        </div>
        <Footer />
      </div>
    </AuthContext.Provider>
  );
}

export default App;
