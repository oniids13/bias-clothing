import React, { useState, useEffect } from "react";
import { useAuth } from "../App";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit states
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Form states
  const [phoneForm, setPhoneForm] = useState("");
  const [addressForm, setAddressForm] = useState({
    street: "",
    barangay: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Philippines",
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/user/profile", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        setPhoneForm(data.user.phone || "");
      } else {
        setError("Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/user/phone", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phone: phoneForm }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile({ ...userProfile, phone: data.user.phone });
        setUser({ ...user, phone: data.user.phone });
        setEditingPhone(false);
        setSuccess("Phone number updated successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update phone");
      }
    } catch (error) {
      console.error("Error updating phone:", error);
      setError("Failed to update phone");
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingAddress
        ? `http://localhost:3000/api/user/address/${editingAddress.id}`
        : "http://localhost:3000/api/user/address";

      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(addressForm),
      });

      if (response.ok) {
        fetchUserProfile(); // Refresh profile
        setShowAddAddress(false);
        setEditingAddress(null);
        setAddressForm({
          street: "",
          barangay: "",
          city: "",
          state: "",
          zipCode: "",
          country: "Philippines",
          isDefault: false,
        });
        setSuccess(
          editingAddress
            ? "Address updated successfully"
            : "Address added successfully"
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      setError("Failed to save address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/user/address/${addressId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        fetchUserProfile(); // Refresh profile
        setSuccess("Address deleted successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      setError("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/user/address/${addressId}/default`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (response.ok) {
        fetchUserProfile(); // Refresh profile
        setSuccess("Default address updated successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to set default address");
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      setError("Failed to set default address");
    }
  };

  const startEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      street: address.street,
      barangay: address.barangay,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setShowAddAddress(true);
  };

  const cancelAddressEdit = () => {
    setEditingAddress(null);
    setShowAddAddress(false);
    setAddressForm({
      street: "",
      barangay: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Philippines",
      isDefault: false,
    });
  };

  // Show loading if user data is not yet available
  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Success and Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-8">
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

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            {editingPhone ? (
              <form onSubmit={handlePhoneUpdate} className="flex gap-2">
                <input
                  type="tel"
                  value={phoneForm}
                  onChange={(e) => setPhoneForm(e.target.value)}
                  placeholder="Enter phone number"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPhone(false);
                    setPhoneForm(userProfile?.phone || "");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <span>{userProfile?.phone || "Not provided"}</span>
                <button
                  onClick={() => setEditingPhone(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Addresses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Addresses</h3>
              <button
                onClick={() => setShowAddAddress(true)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Add Address
              </button>
            </div>

            {/* Address List */}
            <div className="space-y-4">
              {userProfile?.addresses?.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 rounded-lg border-2 ${
                    address.isDefault
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {address.isDefault && (
                        <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full mb-2">
                          Default
                        </span>
                      )}
                      <div className="text-sm text-gray-800">
                        <div className="font-medium">{address.street}</div>
                        <div>{address.barangay}</div>
                        <div>
                          {address.city}, {address.state} {address.zipCode}
                        </div>
                        <div>{address.country}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(address.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => startEditAddress(address)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {(!userProfile?.addresses ||
                userProfile.addresses.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No addresses added yet. Add your first address to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Address Modal */}
      {showAddAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h3>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, street: e.target.value })
                  }
                  placeholder="Enter street address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barangay
                </label>
                <input
                  type="text"
                  value={addressForm.barangay}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, barangay: e.target.value })
                  }
                  placeholder="Enter barangay"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    placeholder="City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                    placeholder="State/Province"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={addressForm.zipCode}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        zipCode: e.target.value,
                      })
                    }
                    placeholder="Zip Code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        country: e.target.value,
                      })
                    }
                    placeholder="Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        isDefault: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">
                    Set as default address
                  </span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  {editingAddress ? "Update Address" : "Add Address"}
                </button>
                <button
                  type="button"
                  onClick={cancelAddressEdit}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
