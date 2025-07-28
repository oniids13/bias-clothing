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

// Get revenue trend data for charts (last 6 months)
const getRevenueTrendData = async () => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get orders grouped by month for the last 6 months
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
        status: { not: "CANCELLED" },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthlyRevenue = {};
    const months = [];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      months.push(monthName);
      monthlyRevenue[monthKey] = 0;
    }

    // Sum revenue by month
    orders.forEach((order) => {
      const monthKey = order.createdAt.toISOString().slice(0, 7);
      if (monthlyRevenue.hasOwnProperty(monthKey)) {
        monthlyRevenue[monthKey] += order.total;
      }
    });

    return {
      labels: months,
      data: Object.values(monthlyRevenue),
    };
  } catch (error) {
    console.error("Error fetching revenue trend data:", error);
    throw error;
  }
};

// Get order status distribution
const getOrderStatusDistribution = async () => {
  try {
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const labels = [];
    const data = [];
    const statusMap = {
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      PROCESSING: "Processing",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
      RETURNED: "Returned",
    };

    statusCounts.forEach((item) => {
      labels.push(statusMap[item.status] || item.status);
      data.push(item._count.status);
    });

    return { labels, data };
  } catch (error) {
    console.error("Error fetching order status distribution:", error);
    throw error;
  }
};

// Get user growth data (last 6 months)
const getUserGrowthData = async () => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
        role: "CUSTOMER",
      },
      select: {
        createdAt: true,
      },
    });

    // Group by month
    const monthlyUsers = {};
    const months = [];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      months.push(monthName);
      monthlyUsers[monthKey] = 0;
    }

    // Count users by month
    users.forEach((user) => {
      const monthKey = user.createdAt.toISOString().slice(0, 7);
      if (monthlyUsers.hasOwnProperty(monthKey)) {
        monthlyUsers[monthKey]++;
      }
    });

    return {
      labels: months,
      data: Object.values(monthlyUsers),
    };
  } catch (error) {
    console.error("Error fetching user growth data:", error);
    throw error;
  }
};

// Get sales by category
const getSalesByCategoryData = async () => {
  try {
    // Get order items with product category information
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: {
          select: {
            category: true,
          },
        },
        order: {
          select: {
            status: true,
          },
        },
      },
      where: {
        order: {
          status: { not: "CANCELLED" },
        },
      },
    });

    // Group by category and sum quantities
    const categoryData = {};
    orderItems.forEach((item) => {
      const category = item.product.category;
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += item.quantity;
    });

    // Sort by quantity and get top categories
    const sortedCategories = Object.entries(categoryData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Top 5 categories

    const labels = sortedCategories.map(([category]) => category);
    const data = sortedCategories.map(([, quantity]) => quantity);

    return { labels, data };
  } catch (error) {
    console.error("Error fetching sales by category data:", error);
    throw error;
  }
};

// Get all dashboard analytics data
const getDashboardAnalytics = async () => {
  try {
    const [revenueTrend, orderStatusDistribution, userGrowth, salesByCategory] =
      await Promise.all([
        getRevenueTrendData(),
        getOrderStatusDistribution(),
        getUserGrowthData(),
        getSalesByCategoryData(),
      ]);

    return {
      revenueTrend,
      orderStatusDistribution,
      userGrowth,
      salesByCategory,
    };
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    throw error;
  }
};

export {
  getAdminStats,
  getRecentActivity,
  getAdminDashboardData,
  getRevenueTrendData,
  getOrderStatusDistribution,
  getUserGrowthData,
  getSalesByCategoryData,
  getDashboardAnalytics,
};
