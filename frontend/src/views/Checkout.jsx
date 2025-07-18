import React, { useState, useEffect } from "react";
import { useAuth } from "../App";
import { cartApi } from "../services/cartApi";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for cart data
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for form data
  const [contactInfo, setContactInfo] = useState({
    fullName: "",
    contactNumber: "",
    email: "",
  });

  const [deliveryDetails, setDeliveryDetails] = useState({
    useSavedAddress: false,
    addressLine1: "",
    addressLine2: "",
    barangay: "",
    city: "",
    zipCode: "",
    region: "",
  });

  const [paymentOption, setPaymentOption] = useState("cash");
  const [processing, setProcessing] = useState(false);

  // Load cart data and populate user info when component mounts
  useEffect(() => {
    if (user) {
      fetchCartData();
      populateUserInfo();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCartTotal();
      if (response.success) {
        setCartData(response);
      } else {
        setError(response.message || "Failed to load cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDefaultAddress = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/user/profile", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const defaultAddress = data.user.addresses?.find(
          (addr) => addr.isDefault
        );

        if (defaultAddress) {
          setDeliveryDetails((prev) => ({
            ...prev,
            addressLine1: defaultAddress.street,
            addressLine2: "",
            barangay: defaultAddress.barangay,
            city: defaultAddress.city,
            zipCode: defaultAddress.zipCode,
            region: defaultAddress.state,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching user default address:", error);
    }
  };

  const populateUserInfo = () => {
    if (user) {
      setContactInfo({
        fullName: user.name || "",
        contactNumber: user.phone || "",
        email: user.email || "",
      });
    }
  };

  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeliveryDetailsChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "useSavedAddress" && checked) {
      // Fetch and populate with user's default address
      fetchUserDefaultAddress();
      setDeliveryDetails((prev) => ({
        ...prev,
        useSavedAddress: true,
      }));
    } else if (name === "useSavedAddress" && !checked) {
      // Clear address fields when unchecked
      setDeliveryDetails((prev) => ({
        ...prev,
        useSavedAddress: false,
        addressLine1: "",
        addressLine2: "",
        barangay: "",
        city: "",
        zipCode: "",
        region: "",
      }));
    } else {
      setDeliveryDetails((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handlePaymentOptionChange = (e) => {
    setPaymentOption(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Validate form
      if (
        !contactInfo.fullName ||
        !contactInfo.contactNumber ||
        !contactInfo.email
      ) {
        setError("Please fill in all contact information");
        return;
      }

      if (
        !deliveryDetails.addressLine1 ||
        !deliveryDetails.barangay ||
        !deliveryDetails.city ||
        !deliveryDetails.zipCode ||
        !deliveryDetails.region
      ) {
        setError("Please fill in all delivery details");
        return;
      }

      // Process the order (this would typically call an API endpoint)
      console.log("Order data:", {
        contactInfo,
        deliveryDetails,
        paymentOption,
        cartData,
      });

      // For now, just show success message
      alert(
        "Order placed successfully! (This is a demo - no actual payment processed)"
      );

      // Redirect to a success page or back to home
      navigate("/");
    } catch (error) {
      console.error("Error processing order:", error);
      setError("Failed to process order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="text-gray-600 mb-4">
            You need to be logged in to checkout.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  const { availableItems = [], subtotal = 0 } = cartData || {};

  if (availableItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-4">
            Add some items to your cart before checking out.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Contact Info</h2>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="fullName"
                    value={contactInfo.fullName}
                    onChange={handleContactInfoChange}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={contactInfo.contactNumber}
                    onChange={handleContactInfoChange}
                    placeholder="Contact Number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={contactInfo.email}
                    onChange={handleContactInfoChange}
                    placeholder="Email Address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Delivery details</h2>

              {/* Checkbox for saved address */}
              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="useSavedAddress"
                    checked={deliveryDetails.useSavedAddress}
                    onChange={handleDeliveryDetailsChange}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">
                    Use saved address from profile
                  </span>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="addressLine1"
                    value={deliveryDetails.addressLine1}
                    onChange={handleDeliveryDetailsChange}
                    placeholder="Address line 1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="addressLine2"
                    value={deliveryDetails.addressLine2}
                    onChange={handleDeliveryDetailsChange}
                    placeholder="Address line 2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="barangay"
                    value={deliveryDetails.barangay}
                    onChange={handleDeliveryDetailsChange}
                    placeholder="Barangay"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    value={deliveryDetails.city}
                    onChange={handleDeliveryDetailsChange}
                    placeholder="City/Municipality"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                  <input
                    type="text"
                    name="zipCode"
                    value={deliveryDetails.zipCode}
                    onChange={handleDeliveryDetailsChange}
                    placeholder="Zip code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="region"
                    value={deliveryDetails.region}
                    onChange={handleDeliveryDetailsChange}
                    placeholder="Region"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Payment Options</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="cash"
                    checked={paymentOption === "cash"}
                    onChange={handlePaymentOptionChange}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 focus:ring-black"
                  />
                  <span className="text-gray-700">Cash</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="maya"
                    checked={paymentOption === "maya"}
                    onChange={handlePaymentOptionChange}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 focus:ring-black"
                  />
                  <span className="text-gray-700">Maya</span>
                </label>
              </div>
            </div>

            {/* Pay Now Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-black text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "PROCESSING..." : "PAY NOW"}
            </button>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-8">
              <h2 className="text-xl font-semibold mb-4">My orders</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {availableItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.imageUrl[0]}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500">×{item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium">
                      ₱{(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold">
                    ₱{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {availableItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  items
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
