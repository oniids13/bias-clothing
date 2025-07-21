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
    const { page = 1, limit = 20, status, search } = options;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
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

// Update order status
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

// Delete order (soft delete by updating status)
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

    const [totalOrders, totalRevenue, statusCounts, recentOrders] =
      await Promise.all([
        prisma.order.count({ where }),
        prisma.order.aggregate({
          where: { ...where, status: { not: "CANCELLED" } },
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
      ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      recentOrders,
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

export {
  // Order queries
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

  // Order item queries
  createOrderItem,
  getOrderItemsByOrder,
  getOrderItemById,
  updateOrderItem,
  deleteOrderItem,
};
