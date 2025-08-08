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
      // Only count revenue from PAID and DELIVERED orders
      prisma.order.aggregate({
        where: {
          status: "DELIVERED",
          paymentStatus: "PAID",
        },
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

// Get revenue trend data for charts (last 6 months) - only PAID and DELIVERED orders
const getRevenueTrendData = async () => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get orders grouped by month for the last 6 months - include more statuses for better data
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
        // Include CONFIRMED, PROCESSING, SHIPPED, and DELIVERED orders
        status: {
          in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
        },
      },
      select: {
        total: true,
        createdAt: true,
        status: true,
        paymentStatus: true,
      },
    });

    // Group by month
    const monthlyRevenue = {};
    const months = [];

    // Initialize last 6 months including current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      // Fix timezone issue by using UTC
      const monthKey = `${targetDate.getFullYear()}-${String(
        targetDate.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthName = targetDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
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

    // Initialize last 6 months including current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      // Fix timezone issue by using UTC
      const monthKey = `${targetDate.getFullYear()}-${String(
        targetDate.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthName = targetDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
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

// Get sales by category - only from PAID and DELIVERED orders
const getSalesByCategoryData = async () => {
  try {
    // Get order items with product category information - only from PAID and DELIVERED orders
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
            paymentStatus: true,
          },
        },
      },
      where: {
        order: {
          status: "DELIVERED",
          paymentStatus: "PAID",
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

// Get sales analytics for different time periods
// Supports optional month (1-12) and year (e.g., 2025) to filter a specific month or year
const getSalesAnalytics = async (period = "monthly", options = {}) => {
  try {
    const now = new Date();
    let startDate;
    let endDate = now;
    const month = options.month ? parseInt(options.month) : undefined; // 1-12
    const year = options.year ? parseInt(options.year) : undefined; // YYYY

    // Compute date range with optional overrides
    if (year && period === "yearly" && !month) {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    } else if (year && month) {
      // Specific month of a specific year
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999); // last day of month
    } else {
      switch (period) {
        case "daily":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "weekly":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "monthly":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "yearly":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    // Get orders within the period
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        // Include more statuses to get more data
        status: {
          in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
        },
        // Include more payment statuses
        paymentStatus: {
          in: ["PENDING", "PAID"],
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                category: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        address: {
          select: {
            city: true,
            state: true,
          },
        },
      },
    });

    // Calculate analytics
    const totalRevenue = orders.reduce((sum, order) => {
      return (
        sum +
        order.items.reduce((orderSum, item) => {
          return orderSum + item.product.price * item.quantity;
        }, 0)
      );
    }, 0);

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by date for trend
    const dailySales = {};
    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      if (!dailySales[dateKey]) {
        dailySales[dateKey] = { revenue: 0, orders: 0 };
      }
      const orderRevenue = order.items.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);
      dailySales[dateKey].revenue += orderRevenue;
      dailySales[dateKey].orders += 1;
    });

    // Get top selling products
    const productSales = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productName = item.product.name;
        if (!productSales[productName]) {
          productSales[productName] = {
            quantity: 0,
            revenue: 0,
            category: item.product.category,
          };
        }
        productSales[productName].quantity += item.quantity;
        productSales[productName].revenue += item.product.price * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue,
        category: data.category,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Get sales by category
    const categorySales = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.product.category;
        if (!categorySales[category]) {
          categorySales[category] = { quantity: 0, revenue: 0 };
        }
        categorySales[category].quantity += item.quantity;
        categorySales[category].revenue += item.product.price * item.quantity;
      });
    });

    const topCategories = Object.entries(categorySales)
      .map(([category, data]) => ({
        category,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Get top customers
    const customerSales = {};
    orders.forEach((order) => {
      const customerId = order.user.id;
      const customerName = order.user.name || order.user.email;

      if (!customerSales[customerId]) {
        customerSales[customerId] = {
          name: customerName,
          email: order.user.email,
          totalSpent: 0,
          orderCount: 0,
          averageOrderValue: 0,
        };
      }

      const orderTotal = order.items.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);

      customerSales[customerId].totalSpent += orderTotal;
      customerSales[customerId].orderCount += 1;
    });

    // Calculate average order value for each customer
    Object.values(customerSales).forEach((customer) => {
      customer.averageOrderValue = customer.totalSpent / customer.orderCount;
    });

    const topCustomers = Object.values(customerSales)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Get sales by location (city)
    const locationSales = {};
    orders.forEach((order) => {
      const city = order.address?.city || "Unknown";
      const state = order.address?.state || "";
      const location = `${city}, ${state}`.trim();

      if (!locationSales[location]) {
        locationSales[location] = {
          city: city,
          state: state,
          totalRevenue: 0,
          orderCount: 0,
          averageOrderValue: 0,
        };
      }

      const orderTotal = order.items.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);

      locationSales[location].totalRevenue += orderTotal;
      locationSales[location].orderCount += 1;
    });

    // Calculate average order value for each location
    Object.values(locationSales).forEach((location) => {
      location.averageOrderValue = location.totalRevenue / location.orderCount;
    });

    const topLocations = Object.values(locationSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Successful orders this month (Delivered & Paid)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    const successfulOrdersThisMonth = await prisma.order.count({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
        status: "DELIVERED",
        paymentStatus: "PAID",
      },
    });

    return {
      period,
      totalRevenue,
      totalOrders,
      averageOrderValue,
      dailySales: Object.entries(dailySales).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      })),
      topProducts,
      topCategories,
      topCustomers,
      topLocations,
      successfulOrdersThisMonth,
      selectedMonth:
        month || (period === "monthly" ? now.getMonth() + 1 : null),
      selectedYear: year || now.getFullYear(),
    };
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
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
  getSalesAnalytics,
};
