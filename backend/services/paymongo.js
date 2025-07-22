import dotenv from "dotenv";
dotenv.config();

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_BASE_URL = "https://api.paymongo.com/v1";

if (!PAYMONGO_SECRET_KEY) {
  throw new Error("PAYMONGO_SECRET_KEY is required in environment variables");
}

// Create Authorization header
const getAuthHeader = () => {
  return `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ":").toString("base64")}`;
};

// Create Payment Intent
export const createPaymentIntent = async (orderData) => {
  try {
    const response = await fetch(`${PAYMONGO_BASE_URL}/payment_intents`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(orderData.total * 100), // Convert to centavos
            payment_method_allowed: ["card", "gcash", "grab_pay", "paymaya"],
            payment_method_options: {
              card: {
                request_three_d_secure: "automatic",
              },
            },
            currency: "PHP",
            description: `Order ${orderData.orderNumber} - ${orderData.customerName}`,
            metadata: {
              order_id: orderData.orderId,
              order_number: orderData.orderNumber,
              customer_email: orderData.customerEmail,
            },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo API Error:", data);
      throw new Error(
        data.errors?.[0]?.detail || "Failed to create payment intent"
      );
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Retrieve Payment Intent
export const getPaymentIntent = async (paymentIntentId) => {
  try {
    const response = await fetch(
      `${PAYMONGO_BASE_URL}/payment_intents/${paymentIntentId}`,
      {
        method: "GET",
        headers: {
          Authorization: getAuthHeader(),
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo API Error:", data);
      throw new Error(
        data.errors?.[0]?.detail || "Failed to retrieve payment intent"
      );
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Create Payment Method (for cards)
export const createPaymentMethod = async (cardDetails) => {
  try {
    const response = await fetch(`${PAYMONGO_BASE_URL}/payment_methods`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: "card",
            details: cardDetails,
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo API Error:", data);
      throw new Error(
        data.errors?.[0]?.detail || "Failed to create payment method"
      );
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error creating payment method:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
