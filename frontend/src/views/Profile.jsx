import { useState, useEffect } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
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
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {user && (
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="text-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-2xl font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              )}
            </div>

            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {user.name || "Not provided"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border text-sm font-mono">
                    {user.id}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Account Actions
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
