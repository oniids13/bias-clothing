import {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  updateTrackingNumber,
  deleteOrder,
  getOrderStats,
  generateOrderNumber,
  createOrderItem,
  getOrderItemsByOrder,
  getOrderItemById,
  updateOrderItem,
  deleteOrderItem,
} from "../model/orderQueries.js";

// ============================================
// ORDER CONTROLLERS
// ============================================

// Create a new order
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

    // Validate items
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

    const order = await createOrder(orderData);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error);
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

// Update order status
const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, adminNotes } = req.body;

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

    const order = await updateOrderStatus(orderId, status, adminNotes);

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

// Delete order (soft delete)
const deleteOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await deleteOrder(orderId);

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

  // Order item controllers
  createOrderItemController,
  getOrderItemsByOrderController,
  getOrderItemByIdController,
  updateOrderItemController,
  deleteOrderItemController,
};
