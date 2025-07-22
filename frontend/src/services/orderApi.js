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

export const orderApi = {
  createAddress,
  createOrder,
  checkStock,
};
