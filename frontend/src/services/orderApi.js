import { apiFetch } from "./httpClient";

// Create a new address for the user
const createAddress = async (addressData) => {
  try {
    const data = await apiFetch(`/user/address`, {
      method: "POST",
      body: addressData,
    });
    return data;
  } catch (error) {
    console.error("Error creating address:", error);
    throw error;
  }
};

// Create a new order
const createOrder = async (orderData) => {
  try {
    const data = await apiFetch(`/order`, { method: "POST", body: orderData });
    return data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Check stock availability before order creation
const checkStock = async (items) => {
  try {
    const data = await apiFetch(`/order/stock/check`, {
      method: "POST",
      body: { items },
    });
    return data;
  } catch (error) {
    console.error("Error checking stock:", error);
    throw error;
  }
};

// Get user orders with pagination
const getUserOrders = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 10, status } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append("status", status);
    }

    const data = await apiFetch(`/order/user/${userId}?${params}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

// Get single order details
const getOrderById = async (orderId) => {
  try {
    const data = await apiFetch(`/order/${orderId}`, { method: "GET" });
    return data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
};

// ============================================
// PAYMONGO INTEGRATION FUNCTIONS
// ============================================

// Create PayMongo Payment Intent
const createPaymentIntent = async (paymentData) => {
  try {
    console.log("API Call - Payment Intent Data:", paymentData);

    const data = await apiFetch(`/order/payment/intent`, {
      method: "POST",
      body: paymentData,
    });
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

// Create PayMongo Payment Method (for cards)
const createPaymentMethod = async (cardDetails) => {
  try {
    const data = await apiFetch(`/order/payment/method`, {
      method: "POST",
      body: { cardDetails },
    });
    return data;
  } catch (error) {
    console.error("Error creating payment method:", error);
    throw error;
  }
};

// Attach Payment Method to Payment Intent
const attachPaymentMethod = async (paymentIntentId, paymentMethodId) => {
  try {
    const data = await apiFetch(`/order/payment/attach`, {
      method: "POST",
      body: { paymentIntentId, paymentMethodId },
    });
    return data;
  } catch (error) {
    console.error("Error attaching payment method:", error);
    throw error;
  }
};

// Get Payment Intent Status
const getPaymentIntentStatus = async (paymentIntentId) => {
  try {
    const data = await apiFetch(`/order/payment/intent/${paymentIntentId}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Error getting payment intent status:", error);
    throw error;
  }
};

// Create Order with PayMongo Payment Processing
const createOrderWithPayment = async (orderData) => {
  try {
    const data = await apiFetch(`/order/payment/create`, {
      method: "POST",
      body: orderData,
    });
    return data;
  } catch (error) {
    console.error("Error creating order with payment:", error);
    throw error;
  }
};

// Handle Payment Success Confirmation
const confirmPayment = async (paymentIntentId, orderId = null) => {
  try {
    const data = await apiFetch(`/order/payment/confirm`, {
      method: "POST",
      body: { paymentIntentId, orderId },
    });
    return data;
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw error;
  }
};

// Create PayMongo Checkout Session
const createCheckoutSession = async (checkoutData) => {
  try {
    console.log("API Call - Checkout Session Data:", checkoutData);

    const data = await apiFetch(`/order/payment/checkout`, {
      method: "POST",
      body: checkoutData,
    });
    console.log("Checkout Session API Response:", data);
    return data;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

// Get Checkout Session Status
const getCheckoutSessionStatus = async (checkoutSessionId) => {
  try {
    const data = await apiFetch(
      `/order/payment/checkout/${checkoutSessionId}`,
      { method: "GET" }
    );
    return data;
  } catch (error) {
    console.error("Error getting checkout session status:", error);
    throw error;
  }
};

// Admin functions
const getOrdersForAdmin = async (options = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (options.page) queryParams.append("page", options.page);
    if (options.limit) queryParams.append("limit", options.limit);
    if (options.search) queryParams.append("search", options.search);
    if (options.status) queryParams.append("status", options.status);
    if (options.paymentMethod)
      queryParams.append("paymentMethod", options.paymentMethod);
    if (options.paymentStatus)
      queryParams.append("paymentStatus", options.paymentStatus);
    if (options.dateFilter)
      queryParams.append("dateFilter", options.dateFilter);
    if (options.successfulOnly)
      queryParams.append("successfulOnly", options.successfulOnly);

    const data = await apiFetch(`/admin/orders?${queryParams}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Error fetching orders for admin:", error);
    return { success: false, message: error.message };
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const data = await apiFetch(`/admin/orders/${orderId}/status`, {
      method: "PUT",
      body: { status },
    });
    return data;
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, message: error.message };
  }
};

const updatePaymentStatus = async (orderId, paymentStatus) => {
  try {
    const data = await apiFetch(`/admin/orders/${orderId}/payment-status`, {
      method: "PUT",
      body: { paymentStatus },
    });
    return data;
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, message: error.message };
  }
};

const generateInvoice = async (orderId) => {
  try {
    // For PDF, use native fetch to get blob using same base URL
    const res = await fetch(`/api/admin/orders/${orderId}/invoice`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return { success: true, data: blob };
  } catch (error) {
    console.error("Error generating invoice:", error);
    return { success: false, message: error.message };
  }
};

// Cancel order (for customers)
const cancelOrder = async (orderId) => {
  try {
    const data = await apiFetch(`/order/${orderId}/cancel`, { method: "PUT" });
    return data;
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { success: false, message: error.message };
  }
};

const reinitiatePayment = async (orderId, paymentMethod = "gcash") => {
  try {
    const data = await apiFetch(`/order/${orderId}/reinitiate-payment`, {
      method: "POST",
      body: { paymentMethod },
    });
    return data;
  } catch (error) {
    console.error("Error reinitiating payment:", error);
    return { success: false, message: error.message };
  }
};

export const orderApi = {
  createAddress,
  createOrder,
  checkStock,
  getUserOrders,
  getOrderById,
  cancelOrder,

  // PayMongo integration
  createPaymentIntent,
  createPaymentMethod,
  attachPaymentMethod,
  getPaymentIntentStatus,
  createOrderWithPayment,
  confirmPayment,
  createCheckoutSession,
  getCheckoutSessionStatus,

  // Admin functions
  getOrdersForAdmin,
  updateOrderStatus,
  updatePaymentStatus,
  generateInvoice,
  reinitiatePayment,
};
