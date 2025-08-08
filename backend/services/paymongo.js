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
    // Validate required fields
    if (
      !orderData.total ||
      !orderData.customerName ||
      !orderData.customerEmail
    ) {
      throw new Error(
        "Missing required fields: total, customerName, customerEmail"
      );
    }

    // Prepare metadata (only include non-null, non-undefined values)
    const metadata = {
      order_number: String(orderData.orderNumber || "TEMP"),
      customer_email: String(orderData.customerEmail),
    };

    // Only add order_id if it exists and is not null
    if (orderData.orderId) {
      metadata.order_id = String(orderData.orderId);
    }

    const paymentIntentData = {
      data: {
        attributes: {
          amount: Math.round(parseFloat(orderData.total) * 100), // Convert to centavos
          payment_method_allowed: ["card", "gcash"],
          currency: "PHP",
          description: `Order ${orderData.orderNumber} - ${orderData.customerName}`,
          metadata: metadata,
        },
      },
    };

    console.log(
      "PayMongo Payment Intent Data:",
      JSON.stringify(paymentIntentData, null, 2)
    );

    const response = await fetch(`${PAYMONGO_BASE_URL}/payment_intents`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentIntentData),
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
            details: {
              card_number: cardDetails.card_number,
              exp_month: cardDetails.exp_month,
              exp_year: cardDetails.exp_year,
              cvc: cardDetails.cvc,
              ...(cardDetails.cardholder_name && {
                cardholder_name: cardDetails.cardholder_name,
              }),
            },
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

// Attach Payment Method to Payment Intent
export const attachPaymentMethod = async (paymentIntentId, paymentMethodId) => {
  try {
    const response = await fetch(
      `${PAYMONGO_BASE_URL}/payment_intents/${paymentIntentId}/attach`,
      {
        method: "POST",
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: paymentMethodId,
              client_key: "", // This will be provided by frontend
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo API Error:", data);
      throw new Error(
        data.errors?.[0]?.detail || "Failed to attach payment method"
      );
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error attaching payment method:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Create Checkout Session (for hosted checkout)
export const createCheckoutSession = async (orderData) => {
  try {
    // Validate required fields
    if (
      !orderData.total ||
      !orderData.customerName ||
      !orderData.customerEmail
    ) {
      throw new Error(
        "Missing required fields: total, customerName, customerEmail"
      );
    }

    // Prepare line items for checkout
    const lineItems = orderData.items
      ? orderData.items.map((item) => ({
          currency: "PHP",
          amount: Math.round(parseFloat(item.unitPrice) * 100), // Convert to centavos
          description: `${item.productName} (${item.size}, ${item.color})`,
          name: item.productName,
          quantity: item.quantity,
        }))
      : [
          {
            currency: "PHP",
            amount: Math.round(parseFloat(orderData.total) * 100),
            description:
              orderData.description || `Order ${orderData.orderNumber}`,
            name: "Order Total",
            quantity: 1,
          },
        ];

    // Prepare metadata (only include non-null, non-undefined values)
    const metadata = {
      order_number: String(orderData.orderNumber || "TEMP"),
      customer_email: String(orderData.customerEmail),
    };

    // Only add order_id if it exists and is not null
    if (orderData.orderId) {
      metadata.order_id = String(orderData.orderId);
    }

    const checkoutSessionData = {
      data: {
        attributes: {
          billing: {
            name: orderData.customerName,
            email: orderData.customerEmail,
          },
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          cancel_url:
            orderData.cancelUrl ||
            "http://localhost:5173/checkout?cancelled=true",
          success_url:
            orderData.successUrl ||
            "http://localhost:5173/checkout?success=true",
          line_items: lineItems,
          payment_method_types: orderData.paymentMethods || ["card", "gcash"],
          description: `Order ${orderData.orderNumber} - ${orderData.customerName}`,
          metadata: metadata,
        },
      },
    };

    console.log(
      "PayMongo Checkout Session Data:",
      JSON.stringify(checkoutSessionData, null, 2)
    );

    const response = await fetch(`${PAYMONGO_BASE_URL}/checkout_sessions`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutSessionData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo Checkout Session API Error:", data);
      throw new Error(
        data.errors?.[0]?.detail || "Failed to create checkout session"
      );
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Retrieve Checkout Session
export const getCheckoutSession = async (checkoutSessionId) => {
  try {
    const response = await fetch(
      `${PAYMONGO_BASE_URL}/checkout_sessions/${checkoutSessionId}`,
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
        data.errors?.[0]?.detail || "Failed to retrieve checkout session"
      );
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Retrieve Source (used by gcash and other redirect flows)
export const getSource = async (sourceId) => {
  try {
    const response = await fetch(`${PAYMONGO_BASE_URL}/sources/${sourceId}`, {
      method: "GET",
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo API Error:", data);
      throw new Error(data.errors?.[0]?.detail || "Failed to retrieve source");
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error retrieving source:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
