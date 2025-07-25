import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get comprehensive admin statistics
const getAdminStats = async () => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalAdmins,
      totalProducts,
      activeProducts,
      inactiveProducts,
      totalOrders,
      revenueData,
    ] = await Promise.all([
      // User statistics
      prisma.user.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),

      // Product statistics
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: false } }),

      // Order statistics
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        customers: totalCustomers,
        admins: totalAdmins,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        inactive: inactiveProducts,
      },
      orders: {
        total: totalOrders,
        revenue: revenueData._sum.total || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

// Get recent activity from multiple sources
const getRecentActivity = async (limit = 10) => {
  try {
    // Fetch recent activities from different sources
    const [recentOrders, recentUsers, recentProducts] = await Promise.all([
      // Recent orders (last 7 days)
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),

      // Recent user registrations (last 7 days)
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
          role: "CUSTOMER", // Only show customer registrations
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),

      // Recent products (last 30 days)
      prisma.product.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          isActive: true,
        },
      }),
    ]);

    // Combine and format activities
    const activities = [];

    // Add order activities
    recentOrders.forEach((order) => {
      activities.push({
        type: "order",
        message: `New order ${order.orderNumber} received from ${
          order.user?.name || "Customer"
        }`,
        timestamp: order.createdAt,
        icon: "shopping_cart",
        details: {
          orderId: order.id,
          customerName: order.user?.name,
          total: order.total,
        },
      });
    });

    // Add user registration activities
    recentUsers.forEach((user) => {
      activities.push({
        type: "user",
        message: `New customer ${user.name || user.email} registered`,
        timestamp: user.createdAt,
        icon: "person_add",
        details: {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
        },
      });
    });

    // Add product activities
    recentProducts.forEach((product) => {
      activities.push({
        type: "product",
        message: `Product "${product.name}" was ${
          product.isActive ? "added" : "deactivated"
        }`,
        timestamp: product.createdAt,
        icon: "inventory",
        details: {
          productId: product.id,
          productName: product.name,
          isActive: product.isActive,
        },
      });
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    return activities.slice(0, parseInt(limit));
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw error;
  }
};

// Get admin dashboard overview data
const getAdminDashboardData = async () => {
  try {
    const [basicStats, recentActivity] = await Promise.all([
      getAdminStats(),
      getRecentActivity(5),
    ]);

    return {
      stats: basicStats,
      recentActivity,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    throw error;
  }
};

export { getAdminStats, getRecentActivity, getAdminDashboardData };
