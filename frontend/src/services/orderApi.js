const API_BASE_URL = "http://localhost:3000/api";

// Create a new address for the user
const createAddress = async (addressData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating address:", error);
    throw error;
  }
};

// Create a new order
const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Check stock availability before order creation
const checkStock = async (items) => {
  try {
    const response = await fetch(`${API_BASE_URL}/order/stock/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
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

    const response = await fetch(
      `${API_BASE_URL}/order/user/${userId}?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

// Get single order details
const getOrderById = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/order/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
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

    const response = await fetch(`${API_BASE_URL}/order/payment/intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    console.log("API Response:", data);

    if (!response.ok) {
      console.error("API Error Response:", data);
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

// Create PayMongo Payment Method (for cards)
const createPaymentMethod = async (cardDetails) => {
  try {
    const response = await fetch(`${API_BASE_URL}/order/payment/method`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ cardDetails }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating payment method:", error);
    throw error;
  }
};

// Attach Payment Method to Payment Intent
const attachPaymentMethod = async (paymentIntentId, paymentMethodId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/order/payment/attach`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ paymentIntentId, paymentMethodId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error attaching payment method:", error);
    throw error;
  }
};

// Get Payment Intent Status
const getPaymentIntentStatus = async (paymentIntentId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/order/payment/intent/${paymentIntentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting payment intent status:", error);
    throw error;
  }
};

// Create Order with PayMongo Payment Processing
const createOrderWithPayment = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/order/payment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating order with payment:", error);
    throw error;
  }
};

// Handle Payment Success Confirmation
const confirmPayment = async (paymentIntentId, orderId = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/order/payment/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ paymentIntentId, orderId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
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

    const response = await fetch(`${API_BASE_URL}/order/payment/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(checkoutData),
    });

    const data = await response.json();
    console.log("Checkout Session API Response:", data);

    if (!response.ok) {
      console.error("Checkout Session API Error Response:", data);
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

// Get Checkout Session Status
const getCheckoutSessionStatus = async (checkoutSessionId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/order/payment/checkout/${checkoutSessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Checkout Session Status API Error Response:", data);
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

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
    if (options.dateFilter)
      queryParams.append("dateFilter", options.dateFilter);

    const response = await fetch(
      `${API_BASE_URL}/admin/orders?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching orders for admin:", error);
    return { success: false, message: error.message };
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/orders/${orderId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, message: error.message };
  }
};

const generateInvoice = async (orderId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/orders/${orderId}/invoice`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle PDF blob response
    const blob = await response.blob();
    return { success: true, data: blob };
  } catch (error) {
    console.error("Error generating invoice:", error);
    return { success: false, message: error.message };
  }
};

export const orderApi = {
  createAddress,
  createOrder,
  checkStock,
  getUserOrders,
  getOrderById,

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
  generateInvoice,
};
