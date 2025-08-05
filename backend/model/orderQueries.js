import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================
// ORDER QUERIES
// ============================================

// Create a new order with order items
const createOrder = async (orderData) => {
  try {
    const order = await prisma.order.create({
      data: {
        userId: orderData.userId,
        addressId: orderData.addressId,
        orderNumber: orderData.orderNumber,
        status: orderData.status || "PENDING",
        subtotal: orderData.subtotal,
        shipping: orderData.shipping || 0,
        discount: orderData.discount || 0,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus || "PENDING",
        paymentIntentId: orderData.paymentIntentId,
        customerNotes: orderData.customerNotes,
        adminNotes: orderData.adminNotes,
        items: {
          create:
            orderData.items?.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })) || [],
        },
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        address: true,
      },
    });
    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Create a new order with stock validation and automatic stock decrease
const createOrderWithStockManagement = async (orderData) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    try {
      // Step 1: Check stock availability for all items
      const stockValidation = await checkStockAvailability(orderData.items);

      if (!stockValidation.allItemsAvailable) {
        throw new Error(
          `Stock validation failed: ${JSON.stringify(
            stockValidation.unavailableItems
          )}`
        );
      }

      // Step 2: Create the order
      const order = await prisma.order.create({
        data: {
          userId: orderData.userId,
          addressId: orderData.addressId,
          orderNumber: orderData.orderNumber,
          status: orderData.status || "PENDING",
          subtotal: orderData.subtotal,
          shipping: orderData.shipping || 0,
          discount: orderData.discount || 0,
          total: orderData.total,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus || "PENDING",
          paymentIntentId: orderData.paymentIntentId,
          customerNotes: orderData.customerNotes,
          adminNotes: orderData.adminNotes,
          items: {
            create:
              orderData.items?.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
              })) || [],
          },
        },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          address: true,
        },
      });

      // Step 3: Decrease stock levels for all order items
      await updateProductStock(orderData.items, "decrease");

      return {
        ...order,
        stockUpdates: stockValidation.stockChecks,
      };
    } catch (error) {
      console.error("Error in createOrderWithStockManagement:", error);
      throw error;
    }
  });

  return transaction;
};

// Get order by ID with all related data
const getOrderById = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                slug: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
      },
    });
    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

// Get orders by user ID
const getOrdersByUser = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 10, status } = options;
    const skip = (page - 1) * limit;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  slug: true,
                },
              },
            },
          },
          address: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

// Get all orders (admin function)
const getAllOrders = async (options = {}) => {
  try {
    const { page = 1, limit = 20, status, search, successfulOnly } = options;
    const skip = (page - 1) * limit;

    const where = {};

    // Handle successful orders filter
    if (successfulOnly) {
      where.AND = [{ status: "DELIVERED" }, { paymentStatus: "PAID" }];
    } else {
      // Exclude successful orders from main orders table
      where.NOT = {
        AND: [{ status: "DELIVERED" }, { paymentStatus: "PAID" }],
      };

      if (status) {
        where.status = status;
      }
    }

    if (search) {
      const searchCondition = {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      };

      if (where.AND) {
        where.AND.push(searchCondition);
      } else if (where.NOT) {
        // If we have NOT condition, we need to restructure
        where.AND = [where.NOT, searchCondition];
        delete where.NOT;
      } else {
        where.OR = searchCondition.OR;
      }
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  slug: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          address: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};

// Update order status with stock restoration for cancellations
const updateOrderStatusWithStockManagement = async (
  orderId,
  newStatus,
  adminNotes = null
) => {
  try {
    // First, get the current order to check its current status
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!currentOrder) {
      throw new Error("Order not found");
    }

    // Check if we need to restore stock (when cancelling or returning)
    const shouldRestoreStock =
      (newStatus === "CANCELLED" || newStatus === "RETURNED") &&
      !["CANCELLED", "RETURNED"].includes(currentOrder.status);

    const transaction = await prisma.$transaction(async (prisma) => {
      // Update the order status
      const updateData = { status: newStatus };
      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          address: true,
        },
      });

      // Restore stock if order is being cancelled or returned
      if (shouldRestoreStock) {
        await updateProductStock(currentOrder.items, "increase");
      }

      return updatedOrder;
    });

    return transaction;
  } catch (error) {
    console.error("Error updating order status with stock management:", error);
    throw error;
  }
};

// Update order status (original function for backward compatibility)
const updateOrderStatus = async (orderId, status, adminNotes = null) => {
  try {
    const updateData = { status };
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        address: true,
      },
    });
    return order;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Update payment status
const updatePaymentStatus = async (
  orderId,
  paymentStatus,
  paymentIntentId = null
) => {
  try {
    const updateData = { paymentStatus };
    if (paymentIntentId) {
      updateData.paymentIntentId = paymentIntentId;
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return order;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

// Update tracking number
const updateTrackingNumber = async (orderId, trackingNumber) => {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { trackingNumber },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return order;
  } catch (error) {
    console.error("Error updating tracking number:", error);
    throw error;
  }
};

// Delete order (soft delete by updating status) with stock restoration
const deleteOrderWithStockManagement = async (orderId) => {
  try {
    // Get the current order to restore stock
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!currentOrder) {
      throw new Error("Order not found");
    }

    const transaction = await prisma.$transaction(async (prisma) => {
      // Update order status to CANCELLED
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      // Restore stock only if order wasn't already cancelled
      if (
        currentOrder.status !== "CANCELLED" &&
        currentOrder.status !== "RETURNED"
      ) {
        await updateProductStock(currentOrder.items, "increase");
      }

      return order;
    });

    return transaction;
  } catch (error) {
    console.error("Error deleting order with stock management:", error);
    throw error;
  }
};

// Delete order (original function for backward compatibility)
const deleteOrder = async (orderId) => {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
    return order;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// Get order statistics (admin)
const getOrderStats = async (dateRange = {}) => {
  try {
    const { startDate, endDate } = dateRange;
    const where = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Setup date ranges for growth calculation
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders,
      totalRevenue,
      statusCounts,
      recentOrders,
      currentMonthOrders,
      previousMonthOrders,
      currentMonthRevenue,
      previousMonthRevenue,
    ] = await Promise.all([
      prisma.order.count({ where }),
      // Only count revenue from PAID and DELIVERED orders
      prisma.order.aggregate({
        where: {
          ...where,
          status: "DELIVERED",
          paymentStatus: "PAID",
        },
        _sum: { total: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where,
        _count: { status: true },
      }),
      prisma.order.findMany({
        where,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      // Current month orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: currentMonthStart,
          },
        },
      }),
      // Previous month orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
      }),
      // Current month revenue - only PAID and DELIVERED
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: currentMonthStart,
          },
          status: "DELIVERED",
          paymentStatus: "PAID",
        },
        _sum: { total: true },
      }),
      // Previous month revenue - only PAID and DELIVERED
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
          status: "DELIVERED",
          paymentStatus: "PAID",
        },
        _sum: { total: true },
      }),
    ]);

    // Calculate growth percentages
    const orderGrowthPercentage =
      previousMonthOrders > 0
        ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) *
          100
        : currentMonthOrders > 0
        ? 100
        : 0;

    const currentRevenue = currentMonthRevenue._sum.total || 0;
    const previousRevenue = previousMonthRevenue._sum.total || 0;
    const revenueGrowthPercentage =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
        ? 100
        : 0;

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      recentOrders,
      currentMonthOrders,
      previousMonthOrders,
      orderGrowthPercentage: Math.round(orderGrowthPercentage * 100) / 100,
      currentMonthRevenue: currentRevenue,
      previousMonthRevenue: previousRevenue,
      revenueGrowthPercentage: Math.round(revenueGrowthPercentage * 100) / 100,
    };
  } catch (error) {
    console.error("Error fetching order stats:", error);
    throw error;
  }
};

// ============================================
// ORDER ITEM QUERIES
// ============================================

// Create a new order item
const createOrderItem = async (orderItemData) => {
  try {
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: orderItemData.orderId,
        productId: orderItemData.productId,
        productName: orderItemData.productName,
        size: orderItemData.size,
        color: orderItemData.color,
        quantity: orderItemData.quantity,
        unitPrice: orderItemData.unitPrice,
        totalPrice: orderItemData.totalPrice,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            slug: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });
    return orderItem;
  } catch (error) {
    console.error("Error creating order item:", error);
    throw error;
  }
};

// Get order items by order ID
const getOrderItemsByOrder = async (orderId) => {
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            slug: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return orderItems;
  } catch (error) {
    console.error("Error fetching order items:", error);
    throw error;
  }
};

// Get order item by ID
const getOrderItemById = async (orderItemId) => {
  try {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            slug: true,
            category: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    return orderItem;
  } catch (error) {
    console.error("Error fetching order item:", error);
    throw error;
  }
};

// Update order item quantity and recalculate total
const updateOrderItem = async (orderItemId, updateData) => {
  try {
    const { quantity, unitPrice } = updateData;
    const totalPrice = quantity * unitPrice;

    const orderItem = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        quantity,
        unitPrice,
        totalPrice,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            slug: true,
          },
        },
      },
    });
    return orderItem;
  } catch (error) {
    console.error("Error updating order item:", error);
    throw error;
  }
};

// Delete order item
const deleteOrderItem = async (orderItemId) => {
  try {
    const orderItem = await prisma.orderItem.delete({
      where: { id: orderItemId },
    });
    return orderItem;
  } catch (error) {
    console.error("Error deleting order item:", error);
    throw error;
  }
};

// Generate unique order number
const generateOrderNumber = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const orderCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
    });

    const orderNumber = `ORD-${currentYear}-${String(orderCount + 1).padStart(
      4,
      "0"
    )}`;
    return orderNumber;
  } catch (error) {
    console.error("Error generating order number:", error);
    throw error;
  }
};

// ============================================
// STOCK MANAGEMENT FUNCTIONS
// ============================================

// Check stock availability for order items
const checkStockAvailability = async (items) => {
  try {
    const stockChecks = await Promise.all(
      items.map(async (item) => {
        const variant = await prisma.productVariant.findUnique({
          where: {
            productId_size_color: {
              productId: item.productId,
              size: item.size,
              color: item.color,
            },
          },
          select: {
            stock: true,
            sku: true,
          },
        });

        if (!variant) {
          return {
            productId: item.productId,
            size: item.size,
            color: item.color,
            available: false,
            error: "Product variant not found",
          };
        }

        const isAvailable = variant.stock >= item.quantity;
        return {
          productId: item.productId,
          size: item.size,
          color: item.color,
          requestedQuantity: item.quantity,
          availableStock: variant.stock,
          sku: variant.sku,
          available: isAvailable,
          error: isAvailable ? null : "Insufficient stock",
        };
      })
    );

    const unavailableItems = stockChecks.filter((check) => !check.available);

    return {
      allItemsAvailable: unavailableItems.length === 0,
      stockChecks,
      unavailableItems,
    };
  } catch (error) {
    console.error("Error checking stock availability:", error);
    throw error;
  }
};

// Update stock levels (decrease for orders, increase for cancellations)
const updateProductStock = async (items, operation = "decrease") => {
  try {
    const stockUpdates = await Promise.all(
      items.map(async (item) => {
        const updateData = {};

        if (operation === "decrease") {
          updateData.stock = { decrement: item.quantity };
        } else if (operation === "increase") {
          updateData.stock = { increment: item.quantity };
        }

        const updatedVariant = await prisma.productVariant.update({
          where: {
            productId_size_color: {
              productId: item.productId,
              size: item.size,
              color: item.color,
            },
          },
          data: updateData,
          select: {
            id: true,
            sku: true,
            stock: true,
            productId: true,
            size: true,
            color: true,
          },
        });

        return updatedVariant;
      })
    );

    return stockUpdates;
  } catch (error) {
    console.error(`Error ${operation}ing stock:`, error);
    throw error;
  }
};

// Get low stock items (admin utility)
const getLowStockItems = async (threshold = 5) => {
  try {
    const lowStockItems = await prisma.productVariant.findMany({
      where: {
        stock: {
          lte: threshold,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        stock: "asc",
      },
    });

    return lowStockItems;
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    throw error;
  }
};

// Get current stock for a specific product variant
const getProductVariantStock = async (productId, size, color) => {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: {
        productId_size_color: {
          productId,
          size,
          color,
        },
      },
      select: {
        stock: true,
        sku: true,
        size: true,
        color: true,
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    return variant;
  } catch (error) {
    console.error("Error fetching product variant stock:", error);
    throw error;
  }
};

export {
  // Order queries
  createOrder,
  createOrderWithStockManagement, // NEW: With stock validation and management
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  updateOrderStatusWithStockManagement, // NEW: With stock restoration
  updatePaymentStatus,
  updateTrackingNumber,
  deleteOrder,
  deleteOrderWithStockManagement, // NEW: With stock restoration
  getOrderStats,
  generateOrderNumber,

  // Order item queries
  createOrderItem,
  getOrderItemsByOrder,
  getOrderItemById,
  updateOrderItem,
  deleteOrderItem,

  // Stock management queries
  checkStockAvailability, // NEW: Check if items are available
  updateProductStock, // NEW: Update stock levels
  getLowStockItems, // NEW: Get low stock alerts
  getProductVariantStock, // NEW: Get specific variant stock
};
