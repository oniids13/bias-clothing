import {
  createOrder,
  createOrderWithStockManagement,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  updateOrderStatusWithStockManagement,
  updatePaymentStatus,
  updateTrackingNumber,
  deleteOrder,
  deleteOrderWithStockManagement,
  getOrderStats,
  generateOrderNumber,
  createOrderItem,
  getOrderItemsByOrder,
  getOrderItemById,
  updateOrderItem,
  deleteOrderItem,
  checkStockAvailability,
  updateProductStock,
  getLowStockItems,
  getProductVariantStock,
} from "../model/orderQueries.js";

import {
  createPaymentIntent,
  createPaymentMethod,
  getPaymentIntent,
  attachPaymentMethod,
  createCheckoutSession,
  getCheckoutSession,
} from "../services/paymongo.js";

// ============================================
// ORDER CONTROLLERS
// ============================================

// Create a new order with stock validation and automatic stock management
const createOrderController = async (req, res) => {
  try {
    const {
      userId,
      addressId,
      subtotal,
      shipping = 0,
      discount = 0,
      total,
      paymentMethod,
      paymentStatus = "PENDING",
      paymentIntentId,
      customerNotes,
      items,
    } = req.body;

    // Validation
    if (
      !userId ||
      !addressId ||
      !subtotal ||
      !total ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: userId, addressId, subtotal, total, and items are required",
      });
    }

    // Validate items structure
    for (const item of items) {
      if (
        !item.productId ||
        !item.productName ||
        !item.size ||
        !item.color ||
        !item.quantity ||
        !item.unitPrice
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each item must have productId, productName, size, color, quantity, and unitPrice",
        });
      }

      // Validate positive quantities
      if (item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Item quantities must be positive numbers",
        });
      }

      item.totalPrice = item.quantity * item.unitPrice;
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    const orderData = {
      userId,
      addressId,
      orderNumber,
      subtotal,
      shipping,
      discount,
      total,
      paymentMethod,
      paymentStatus,
      paymentIntentId,
      customerNotes,
      items,
    };

    // Create order with stock management
    const order = await createOrderWithStockManagement(orderData);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    // Handle stock validation errors specifically
    if (error.message.includes("Stock validation failed")) {
      try {
        const stockError = JSON.parse(
          error.message.replace("Stock validation failed: ", "")
        );
        return res.status(400).json({
          success: false,
          message: "Some items are out of stock or have insufficient inventory",
          stockErrors: stockError,
          error: "INSUFFICIENT_STOCK",
        });
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: "Stock validation failed",
          error: error.message,
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Get order by ID
const getOrderByIdController = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order",
      error: error.message,
    });
  }
};

// Get orders by user
const getOrdersByUserController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    };

    const result = await getOrdersByUser(userId, options);

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get orders by user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: error.message,
    });
  }
};

// Get all orders (Admin)
const getAllOrdersController = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      search,
    };

    const result = await getAllOrders(options);

    res.status(200).json({
      success: true,
      message: "All orders retrieved successfully",
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: error.message,
    });
  }
};

// Update order status with stock management
const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, adminNotes, useStockManagement = true } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required",
      });
    }

    // Validate status enum
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Use stock management version by default
    const order = useStockManagement
      ? await updateOrderStatusWithStockManagement(orderId, status, adminNotes)
      : await updateOrderStatus(orderId, status, adminNotes);

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// Update payment status
const updatePaymentStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, paymentIntentId } = req.body;

    if (!orderId || !paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "Order ID and payment status are required",
      });
    }

    // Validate payment status enum
    const validPaymentStatuses = [
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
    ];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(
          ", "
        )}`,
      });
    }

    const order = await updatePaymentStatus(
      orderId,
      paymentStatus,
      paymentIntentId
    );

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
};

// Update tracking number
const updateTrackingNumberController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber } = req.body;

    if (!orderId || !trackingNumber) {
      return res.status(400).json({
        success: false,
        message: "Order ID and tracking number are required",
      });
    }

    const order = await updateTrackingNumber(orderId, trackingNumber);

    res.status(200).json({
      success: true,
      message: "Tracking number updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update tracking number error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tracking number",
      error: error.message,
    });
  }
};

// Delete order (soft delete) with stock restoration
const deleteOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { useStockManagement = true } = req.query;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Use stock management version by default
    const order = useStockManagement
      ? await deleteOrderWithStockManagement(orderId)
      : await deleteOrder(orderId);

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// Get order statistics (Admin)
const getOrderStatsController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    const stats = await getOrderStats(dateRange);

    res.status(200).json({
      success: true,
      message: "Order statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order statistics",
      error: error.message,
    });
  }
};

// ============================================
// STOCK MANAGEMENT CONTROLLERS
// ============================================

// Check stock availability for items before order creation
const checkStockController = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array is required",
      });
    }

    // Validate items structure
    for (const item of items) {
      if (!item.productId || !item.size || !item.color || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: "Each item must have productId, size, color, and quantity",
        });
      }
    }

    const stockCheck = await checkStockAvailability(items);

    res.status(200).json({
      success: true,
      message: "Stock availability checked successfully",
      data: stockCheck,
    });
  } catch (error) {
    console.error("Check stock error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check stock availability",
      error: error.message,
    });
  }
};

// Get low stock items (Admin)
const getLowStockController = async (req, res) => {
  try {
    const { threshold = 5 } = req.query;

    const lowStockItems = await getLowStockItems(parseInt(threshold));

    res.status(200).json({
      success: true,
      message: "Low stock items retrieved successfully",
      data: lowStockItems,
      threshold: parseInt(threshold),
    });
  } catch (error) {
    console.error("Get low stock error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve low stock items",
      error: error.message,
    });
  }
};

// Get stock for specific product variant
const getVariantStockController = async (req, res) => {
  try {
    const { productId, size, color } = req.params;

    if (!productId || !size || !color) {
      return res.status(400).json({
        success: false,
        message: "Product ID, size, and color are required",
      });
    }

    const variantStock = await getProductVariantStock(productId, size, color);

    if (!variantStock) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product variant stock retrieved successfully",
      data: variantStock,
    });
  } catch (error) {
    console.error("Get variant stock error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve variant stock",
      error: error.message,
    });
  }
};

// ============================================
// ORDER ITEM CONTROLLERS
// ============================================

// Create order item
const createOrderItemController = async (req, res) => {
  try {
    const {
      orderId,
      productId,
      productName,
      size,
      color,
      quantity,
      unitPrice,
    } = req.body;

    if (
      !orderId ||
      !productId ||
      !productName ||
      !size ||
      !color ||
      !quantity ||
      !unitPrice
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: orderId, productId, productName, size, color, quantity, unitPrice",
      });
    }

    const totalPrice = quantity * unitPrice;

    const orderItemData = {
      orderId,
      productId,
      productName,
      size,
      color,
      quantity,
      unitPrice,
      totalPrice,
    };

    const orderItem = await createOrderItem(orderItemData);

    res.status(201).json({
      success: true,
      message: "Order item created successfully",
      data: orderItem,
    });
  } catch (error) {
    console.error("Create order item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order item",
      error: error.message,
    });
  }
};

// Get order items by order ID
const getOrderItemsByOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const orderItems = await getOrderItemsByOrder(orderId);

    res.status(200).json({
      success: true,
      message: "Order items retrieved successfully",
      data: orderItems,
    });
  } catch (error) {
    console.error("Get order items by order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order items",
      error: error.message,
    });
  }
};

// Get order item by ID
const getOrderItemByIdController = async (req, res) => {
  try {
    const { orderItemId } = req.params;

    if (!orderItemId) {
      return res.status(400).json({
        success: false,
        message: "Order item ID is required",
      });
    }

    const orderItem = await getOrderItemById(orderItemId);

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Order item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order item retrieved successfully",
      data: orderItem,
    });
  } catch (error) {
    console.error("Get order item by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order item",
      error: error.message,
    });
  }
};

// Update order item
const updateOrderItemController = async (req, res) => {
  try {
    const { orderItemId } = req.params;
    const { quantity, unitPrice } = req.body;

    if (!orderItemId) {
      return res.status(400).json({
        success: false,
        message: "Order item ID is required",
      });
    }

    if (!quantity || !unitPrice) {
      return res.status(400).json({
        success: false,
        message: "Quantity and unit price are required",
      });
    }

    if (quantity <= 0 || unitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity and unit price must be positive numbers",
      });
    }

    const updateData = { quantity, unitPrice };
    const orderItem = await updateOrderItem(orderItemId, updateData);

    res.status(200).json({
      success: true,
      message: "Order item updated successfully",
      data: orderItem,
    });
  } catch (error) {
    console.error("Update order item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order item",
      error: error.message,
    });
  }
};

// Delete order item
const deleteOrderItemController = async (req, res) => {
  try {
    const { orderItemId } = req.params;

    if (!orderItemId) {
      return res.status(400).json({
        success: false,
        message: "Order item ID is required",
      });
    }

    const orderItem = await deleteOrderItem(orderItemId);

    res.status(200).json({
      success: true,
      message: "Order item deleted successfully",
      data: orderItem,
    });
  } catch (error) {
    console.error("Delete order item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order item",
      error: error.message,
    });
  }
};

// ============================================
// PAYMONGO INTEGRATION CONTROLLERS
// ============================================

// Create PayMongo Payment Intent
const createPaymentIntentController = async (req, res) => {
  try {
    const { total, customerName, customerEmail, orderNumber } = req.body;

    if (!total || !customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Total, customer name, and customer email are required",
      });
    }

    const orderData = {
      total: parseFloat(total),
      customerName: String(customerName || ""),
      customerEmail: String(customerEmail || ""),
      orderNumber: String(orderNumber || `TEMP-${Date.now()}`),
      orderId: null, // Will be set when order is created
    };

    const paymentIntentResponse = await createPaymentIntent(orderData);

    if (!paymentIntentResponse.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to create payment intent",
        error: paymentIntentResponse.error,
      });
    }

    res.status(201).json({
      success: true,
      message: "Payment intent created successfully",
      data: {
        paymentIntentId: paymentIntentResponse.data.id,
        clientKey: paymentIntentResponse.data.attributes.client_key,
        amount: paymentIntentResponse.data.attributes.amount,
        currency: paymentIntentResponse.data.attributes.currency,
        status: paymentIntentResponse.data.attributes.status,
      },
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment intent",
      error: error.message,
    });
  }
};

// Create PayMongo Payment Method (for cards)
const createPaymentMethodController = async (req, res) => {
  try {
    const { cardDetails } = req.body;

    if (!cardDetails) {
      return res.status(400).json({
        success: false,
        message: "Card details are required",
      });
    }

    // Validate card details structure
    const { card_number, exp_month, exp_year, cvc, cardholder_name } =
      cardDetails;

    if (!card_number || !exp_month || !exp_year || !cvc) {
      return res.status(400).json({
        success: false,
        message: "Complete card details are required",
      });
    }

    const paymentMethodResponse = await createPaymentMethod({
      card_number,
      exp_month: parseInt(exp_month),
      exp_year: parseInt(exp_year),
      cvc,
      ...(cardholder_name && { cardholder_name }),
    });

    if (!paymentMethodResponse.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to create payment method",
        error: paymentMethodResponse.error,
      });
    }

    res.status(201).json({
      success: true,
      message: "Payment method created successfully",
      data: {
        paymentMethodId: paymentMethodResponse.data.id,
        type: paymentMethodResponse.data.attributes.type,
        details: paymentMethodResponse.data.attributes.details,
      },
    });
  } catch (error) {
    console.error("Create payment method error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment method",
      error: error.message,
    });
  }
};

// Get Payment Intent Status
const getPaymentIntentController = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID is required",
      });
    }

    const paymentIntentResponse = await getPaymentIntent(paymentIntentId);

    if (!paymentIntentResponse.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to retrieve payment intent",
        error: paymentIntentResponse.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment intent retrieved successfully",
      data: {
        paymentIntentId: paymentIntentResponse.data.id,
        status: paymentIntentResponse.data.attributes.status,
        amount: paymentIntentResponse.data.attributes.amount,
        currency: paymentIntentResponse.data.attributes.currency,
        paymentMethod: paymentIntentResponse.data.attributes.payment_method,
        metadata: paymentIntentResponse.data.attributes.metadata,
      },
    });
  } catch (error) {
    console.error("Get payment intent error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment intent",
      error: error.message,
    });
  }
};

// Create Order with PayMongo Payment Processing
const createOrderWithPaymentController = async (req, res) => {
  try {
    const {
      userId,
      addressId,
      subtotal,
      shipping = 0,
      discount = 0,
      total,
      paymentMethod,
      customerNotes,
      items,
      paymentDetails, // Contains payment method info for PayMongo
    } = req.body;

    // Validation
    if (
      !userId ||
      !addressId ||
      !subtotal ||
      !total ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: userId, addressId, subtotal, total, and items are required",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    // Validate items structure
    for (const item of items) {
      if (
        !item.productId ||
        !item.productName ||
        !item.size ||
        !item.color ||
        !item.quantity ||
        !item.unitPrice
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each item must have productId, productName, size, color, quantity, and unitPrice",
        });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Item quantities must be positive numbers",
        });
      }
      item.totalPrice = item.quantity * item.unitPrice;
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Get user info for payment intent
    const userResponse = await fetch(`http://localhost:3000/api/user/profile`, {
      headers: { "user-id": userId },
    });

    let customerName = "Customer";
    let customerEmail = "customer@example.com";

    if (userResponse.ok) {
      const userData = await userResponse.json();
      customerName = userData.user?.name || customerName;
      customerEmail = userData.user?.email || customerEmail;
    }

    // Create payment intent with PayMongo
    const paymentIntentData = {
      total,
      customerName,
      customerEmail,
      orderNumber,
      orderId: null, // Will be updated after order creation
    };

    const paymentIntentResponse = await createPaymentIntent(paymentIntentData);

    if (!paymentIntentResponse.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to create payment intent",
        error: paymentIntentResponse.error,
      });
    }

    const paymentIntentId = paymentIntentResponse.data.id;

    // Create order data
    const orderData = {
      userId,
      addressId,
      orderNumber,
      subtotal,
      shipping,
      discount,
      total,
      paymentMethod: paymentMethod.toUpperCase(),
      paymentStatus: "PENDING",
      paymentIntentId,
      customerNotes,
      items,
    };

    // Create order with stock management
    const order = await createOrderWithStockManagement(orderData);

    res.status(201).json({
      success: true,
      message: "Order created successfully with payment intent",
      data: {
        order,
        payment: {
          paymentIntentId: paymentIntentResponse.data.id,
          clientKey: paymentIntentResponse.data.attributes.client_key,
          status: paymentIntentResponse.data.attributes.status,
        },
      },
    });
  } catch (error) {
    console.error("Create order with payment error:", error);

    // Handle stock validation errors specifically
    if (error.message.includes("Stock validation failed")) {
      try {
        const stockError = JSON.parse(
          error.message.replace("Stock validation failed: ", "")
        );
        return res.status(400).json({
          success: false,
          message: "Some items are out of stock or have insufficient inventory",
          stockErrors: stockError,
          error: "INSUFFICIENT_STOCK",
        });
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: "Stock validation failed",
          error: error.message,
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to create order with payment",
      error: error.message,
    });
  }
};

// Handle Payment Success Webhook/Confirmation
const handlePaymentSuccessController = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID is required",
      });
    }

    // Verify payment with PayMongo
    const paymentIntentResponse = await getPaymentIntent(paymentIntentId);

    if (!paymentIntentResponse.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to verify payment",
        error: paymentIntentResponse.error,
      });
    }

    const paymentStatus = paymentIntentResponse.data.attributes.status;

    // Update order payment status based on PayMongo response
    let newPaymentStatus = "PENDING";
    let newOrderStatus = "PENDING";

    switch (paymentStatus) {
      case "succeeded":
        newPaymentStatus = "PAID";
        newOrderStatus = "CONFIRMED";
        break;
      case "processing":
        newPaymentStatus = "PENDING";
        newOrderStatus = "PENDING";
        break;
      case "requires_payment_method":
      case "canceled":
        newPaymentStatus = "FAILED";
        newOrderStatus = "CANCELLED";
        break;
      default:
        newPaymentStatus = "PENDING";
    }

    // Find order by payment intent ID if orderId not provided
    let targetOrderId = orderId;
    if (!targetOrderId) {
      const orders = await getAllOrders({ limit: 100 });
      const matchingOrder = orders.orders.find(
        (order) => order.paymentIntentId === paymentIntentId
      );
      if (matchingOrder) {
        targetOrderId = matchingOrder.id;
      }
    }

    if (!targetOrderId) {
      return res.status(404).json({
        success: false,
        message: "Order not found for payment intent",
      });
    }

    // Update payment status
    const updatedOrder = await updatePaymentStatus(
      targetOrderId,
      newPaymentStatus,
      paymentIntentId
    );

    // Update order status if payment succeeded
    if (newPaymentStatus === "PAID") {
      await updateOrderStatus(targetOrderId, newOrderStatus);
    } else if (newPaymentStatus === "FAILED") {
      // Cancel order and restore stock if payment failed
      await deleteOrderWithStockManagement(targetOrderId);
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: {
        orderId: targetOrderId,
        paymentStatus: newPaymentStatus,
        orderStatus: newOrderStatus,
        paymentIntentStatus: paymentStatus,
      },
    });
  } catch (error) {
    console.error("Handle payment success error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to handle payment confirmation",
      error: error.message,
    });
  }
};

// Attach Payment Method to Payment Intent
const attachPaymentMethodController = async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    if (!paymentIntentId || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID and payment method ID are required",
      });
    }

    const attachResponse = await attachPaymentMethod(
      paymentIntentId,
      paymentMethodId
    );

    if (!attachResponse.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to attach payment method",
        error: attachResponse.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment method attached successfully",
      data: {
        paymentIntentId: attachResponse.data.id,
        status: attachResponse.data.attributes.status,
        paymentMethod: attachResponse.data.attributes.payment_method,
      },
    });
  } catch (error) {
    console.error("Attach payment method error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to attach payment method",
      error: error.message,
    });
  }
};

// Create PayMongo Checkout Session (for hosted checkout)
const createCheckoutSessionController = async (req, res) => {
  try {
    const {
      total,
      customerName,
      customerEmail,
      orderNumber,
      items,
      cancelUrl,
      successUrl,
      paymentMethods,
    } = req.body;

    if (!total || !customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Total, customer name, and customer email are required",
      });
    }

    const orderData = {
      total,
      customerName,
      customerEmail,
      orderNumber,
      items,
      cancelUrl,
      successUrl,
      paymentMethods,
    };

    const checkoutSessionResponse = await createCheckoutSession(orderData);

    if (!checkoutSessionResponse.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to create checkout session",
        error: checkoutSessionResponse.error,
      });
    }

    res.status(201).json({
      success: true,
      message: "Checkout session created successfully",
      data: {
        checkoutSessionId: checkoutSessionResponse.data.id,
        checkoutUrl: checkoutSessionResponse.data.attributes.checkout_url,
        status: checkoutSessionResponse.data.attributes.status,
      },
    });
  } catch (error) {
    console.error("Create checkout session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
      error: error.message,
    });
  }
};

// Retrieve Checkout Session
const getCheckoutSessionController = async (req, res) => {
  try {
    const { checkoutSessionId } = req.params;

    if (!checkoutSessionId) {
      return res.status(400).json({
        success: false,
        message: "Checkout session ID is required",
      });
    }

    const checkoutSessionResponse = await getCheckoutSession(checkoutSessionId);

    if (!checkoutSessionResponse.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to retrieve checkout session",
        error: checkoutSessionResponse.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Checkout session retrieved successfully",
      data: {
        checkoutSessionId: checkoutSessionResponse.data.id,
        status: checkoutSessionResponse.data.attributes.status,
        checkoutUrl: checkoutSessionResponse.data.attributes.checkout_url,
        paymentIntent: checkoutSessionResponse.data.attributes.payment_intent,
        metadata: checkoutSessionResponse.data.attributes.metadata,
      },
    });
  } catch (error) {
    console.error("Get checkout session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve checkout session",
      error: error.message,
    });
  }
};

export {
  // Order controllers
  createOrderController,
  getOrderByIdController,
  getOrdersByUserController,
  getAllOrdersController,
  updateOrderStatusController,
  updatePaymentStatusController,
  updateTrackingNumberController,
  deleteOrderController,
  getOrderStatsController,

  // Stock management controllers
  checkStockController,
  getLowStockController,
  getVariantStockController,

  // Order item controllers
  createOrderItemController,
  getOrderItemsByOrderController,
  getOrderItemByIdController,
  updateOrderItemController,
  deleteOrderItemController,

  // PayMongo integration controllers
  createPaymentIntentController,
  createPaymentMethodController,
  getPaymentIntentController,
  createOrderWithPaymentController,
  handlePaymentSuccessController,
  attachPaymentMethodController,
  createCheckoutSessionController,
  getCheckoutSessionController,
};
