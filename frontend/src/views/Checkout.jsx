import React, { useState, useEffect } from "react";
import { useAuth } from "../App";
import { cartApi } from "../services/cartApi";
import { orderApi } from "../services/orderApi";
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
    makeDefault: false,
  });

  const [paymentOption, setPaymentOption] = useState("gcash");
  const [processing, setProcessing] = useState(false);

  // State for payment success
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);

  // Load cart data and populate user info when component mounts
  useEffect(() => {
    if (user) {
      fetchCartData();
      populateUserInfo();

      // Check for payment success from PayMongo redirect
      const urlParams = new URLSearchParams(window.location.search);
      const paymentSuccess = urlParams.get("success");
      const paymentCancelled = urlParams.get("cancelled");

      if (paymentSuccess === "true") {
        handlePaymentSuccess();
      } else if (paymentCancelled === "true") {
        handlePaymentCancelled();
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle payment success from PayMongo redirect
  const handlePaymentSuccess = async () => {
    try {
      console.log("Payment successful, clearing cart...");
      setProcessing(true);
      setPaymentSuccessful(true);

      // Get orderId from URL
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get("order_id");
      if (orderId) {
        try {
          // Update payment status to PAID
          await fetch(`http://localhost:3000/api/order/${orderId}/payment`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ paymentStatus: "PAID" }),
          });
        } catch (err) {
          console.error("Failed to update payment status:", err);
        }
      }

      // Clear the cart
      await cartApi.clearCart();

      // Show success message
      setError("");

      // Clean up URL parameters
      const url = new URL(window.location);
      url.searchParams.delete("success");
      url.searchParams.delete("order_id");
      window.history.replaceState({}, document.title, url.pathname);

      // Redirect to home after a short delay
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Error handling payment success:", error);
      setError(
        "Payment was successful, but there was an error clearing your cart. Please refresh the page."
      );
      setProcessing(false);
    }
  };

  // Handle payment cancellation from PayMongo redirect
  const handlePaymentCancelled = () => {
    console.log("Payment was cancelled");

    // Show cancellation message
    setError("Payment was cancelled. You can try again.");

    // Clean up URL parameters
    const url = new URL(window.location);
    url.searchParams.delete("cancelled");
    window.history.replaceState({}, document.title, url.pathname);
  };

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
    setError("");

    // Defensive check for user and user.id
    console.log("Checkout user object:", user);
    if (!user || !user.id) {
      setError("User information is missing. Please log out and log in again.");
      setProcessing(false);
      return;
    }

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

      // Transform cart items to order items format
      const orderItems = availableItems.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.product.price,
      }));

      console.log("Order Items for API:", orderItems);

      // Check stock availability first
      const stockCheckResponse = await orderApi.checkStock(orderItems);
      console.log("Stock Check Response:", stockCheckResponse);

      if (
        !stockCheckResponse.success ||
        !stockCheckResponse.data.allItemsAvailable
      ) {
        setError("Some items are out of stock. Please update your cart.");
        console.log("Stock Issues:", stockCheckResponse.data.unavailableItems);
        return;
      }

      // Create address for the order (only if not using saved address)
      let addressId;

      if (deliveryDetails.useSavedAddress) {
        // If using saved address, we need to get the user's default address
        try {
          const userResponse = await fetch(
            "http://localhost:3000/api/user/profile",
            {
              credentials: "include",
            }
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            const defaultAddress = userData.user.addresses?.find(
              (addr) => addr.isDefault
            );

            if (defaultAddress) {
              addressId = defaultAddress.id;
              console.log("Using saved address ID:", addressId);
            } else {
              setError(
                "No default address found. Please add an address to your profile."
              );
              return;
            }
          } else {
            setError("Failed to fetch user profile");
            return;
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setError("Failed to fetch user profile");
          return;
        }
      } else {
        // Create new address
        const addressData = {
          street:
            deliveryDetails.addressLine1 +
            (deliveryDetails.addressLine2
              ? `, ${deliveryDetails.addressLine2}`
              : ""),
          barangay: deliveryDetails.barangay,
          city: deliveryDetails.city,
          state: deliveryDetails.region,
          zipCode: deliveryDetails.zipCode,
          country: "Philippines",
          isDefault: Boolean(deliveryDetails.makeDefault),
        };

        console.log("Creating new address:", addressData);
        const addressResponse = await orderApi.createAddress(addressData);
        console.log("Address Response:", addressResponse);

        if (!addressResponse.success) {
          setError("Failed to save delivery address");
          return;
        }

        const createdAddress = addressResponse.address || addressResponse.data;
        if (!createdAddress || !createdAddress.id) {
          setError("Address saved but response was missing the address ID");
          return;
        }
        addressId = createdAddress.id;
      }

      // Calculate totals
      const orderSubtotal = availableItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const shipping = 0; // Free shipping for now
      const discount = 0; // No discount for now
      const total = orderSubtotal + shipping - discount;

      // PayMongo Payment Processing
      if (paymentOption === "card" || paymentOption === "gcash") {
        await handlePayMongoPayment({
          userId: user.id,
          addressId,
          subtotal: orderSubtotal,
          shipping,
          discount,
          total,
          paymentMethod: paymentOption,
          customerNotes: `Customer: ${contactInfo.fullName}, Phone: ${contactInfo.contactNumber}`,
          items: orderItems,
        });
      } else {
        // Fallback to direct order creation for other payment methods
        await handleDirectOrderCreation({
          userId: user.id,
          addressId,
          subtotal: orderSubtotal,
          shipping,
          discount,
          total,
          paymentMethod: paymentOption.toUpperCase(),
          customerNotes: `Customer: ${contactInfo.fullName}, Phone: ${contactInfo.contactNumber}`,
          items: orderItems,
        });
      }
    } catch (error) {
      console.error("Error processing order:", error);
      // Show the real error message if available
      if (error && error.message) {
        setError(error.message);
      } else if (typeof error === "string") {
        setError(error);
      } else {
        setError("Failed to process order. Please try again.");
      }
    } finally {
      setProcessing(false);
    }
  };

  // Replace the handlePayMongoPayment function with this:
  const handlePayMongoPayment = async (orderData) => {
    try {
      console.log("Processing PayMongo hosted checkout...");

      // 1) Create order FIRST to get the orderId
      const orderResponse = await orderApi.createOrder({
        ...orderData,
        paymentStatus: "PENDING",
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || "Failed to create order");
      }

      const createdOrder = orderResponse.data;
      const createdOrderId = createdOrder?.id;
      if (!createdOrderId) {
        throw new Error("Order created but no order ID returned");
      }

      // 2) Create Checkout Session with success URL that includes the order ID
      const checkoutSessionData = {
        total: orderData.total,
        customerName: contactInfo.fullName,
        customerEmail: contactInfo.email,
        orderNumber: createdOrder.orderNumber || `ORD-${Date.now()}`,
        items: orderData.items,
        cancelUrl: `http://localhost:3000/api/order/payment/redirect?status=cancelled&order_id=${createdOrderId}`,
        successUrl: `http://localhost:3000/api/order/payment/redirect?success=true&order_id=${createdOrderId}`,
        paymentMethods: [paymentOption],
        orderId: createdOrderId,
      };

      console.log("Creating checkout session:", checkoutSessionData);

      const checkoutResponse = await orderApi.createCheckoutSession(
        checkoutSessionData
      );
      console.log("Checkout Session Response:", checkoutResponse);

      if (!checkoutResponse.success) {
        throw new Error(
          checkoutResponse.message || "Failed to create checkout session"
        );
      }

      const { checkoutUrl, checkoutSessionId } = checkoutResponse.data;
      if (!checkoutUrl) {
        console.error(
          "No checkout URL received from PayMongo!",
          checkoutResponse
        );
        throw new Error("No checkout URL received from PayMongo");
      }

      // 3) Optionally associate the checkout session ID to the order (as paymentIntentId)
      try {
        await fetch(
          `http://localhost:3000/api/order/${createdOrderId}/payment`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              paymentStatus: "PENDING",
              paymentIntentId: checkoutSessionId,
            }),
          }
        );
      } catch (assocErr) {
        console.warn(
          "Failed to associate checkout session to order:",
          assocErr
        );
      }

      console.log("Order created, redirecting to PayMongo checkout...");

      // 4) Redirect to PayMongo hosted checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("PayMongo hosted checkout error:", error);
      throw error;
    }
  };

  // Handle direct order creation (fallback)
  const handleDirectOrderCreation = async (orderData) => {
    try {
      console.log("Creating direct order...");

      const orderResponse = await orderApi.createOrder(orderData);
      console.log("Direct Order Response:", orderResponse);

      if (orderResponse.success) {
        await handleSuccessfulOrder(orderResponse.data);
      } else {
        throw new Error(orderResponse.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Direct order creation error:", error);
      throw error;
    }
  };

  // Handle successful order completion
  const handleSuccessfulOrder = async (order) => {
    try {
      console.log("Order completed successfully:", order);

      // Clear the cart after successful order
      try {
        await cartApi.clearCart();
        console.log("Cart cleared successfully");
      } catch (clearError) {
        console.error("Failed to clear cart:", clearError);
        // Don't fail the whole process if cart clear fails
      }

      // Show success message
      alert(`Order created successfully! Order Number: ${order.orderNumber}`);

      // Redirect to a success page or back to home
      navigate("/");
    } catch (error) {
      console.error("Error handling successful order:", error);
      // Don't throw here as the order was already created successfully
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

        {paymentSuccessful && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700 mr-2"></div>
              Payment successful! Your order has been placed. Redirecting to
              home page...
            </div>
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
                {/* Make default checkbox */}
                {!deliveryDetails.useSavedAddress && (
                  <label className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      name="makeDefault"
                      checked={deliveryDetails.makeDefault}
                      onChange={handleDeliveryDetailsChange}
                      className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black"
                    />
                    <span className="text-sm text-gray-700">
                      Make this my default address
                    </span>
                  </label>
                )}
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
                    value="gcash"
                    checked={paymentOption === "gcash"}
                    onChange={handlePaymentOptionChange}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 focus:ring-black"
                  />
                  <span className="text-gray-700">GCash</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="card"
                    checked={paymentOption === "card"}
                    onChange={handlePaymentOptionChange}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 focus:ring-black"
                  />
                  <span className="text-gray-700">Credit/Debit Card</span>
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
