import express from "express";
import {
  getUserCountController,
  getAllUsersController,
  getUserStatsController,
} from "../controller/userController.js";
import {
  getProductCountController,
  getProductStatsController,
  getAllProductsForAdminController,
} from "../controller/productController.js";
import { getUserStats } from "../model/userQueries.js";
import { getProductStats } from "../model/productQueries.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

// User Management Routes
router.get("/users/count", requireAuth, requireAdmin, getUserCountController);
router.get("/users", requireAuth, requireAdmin, getAllUsersController);
router.get("/users/stats", requireAuth, requireAdmin, getUserStatsController);

// Product Management Routes
router.get(
  "/products/count",
  requireAuth,
  requireAdmin,
  getProductCountController
);
router.get(
  "/products",
  requireAuth,
  requireAdmin,
  getAllProductsForAdminController
);
router.get(
  "/products/stats",
  requireAuth,
  requireAdmin,
  getProductStatsController
);

// Admin Dashboard Stats Route
router.get("/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    // Get all statistics for admin dashboard
    const [userStats, productStats, orderResponse] = await Promise.all([
      getUserStats(),
      getProductStats(),
      fetch("http://localhost:3000/api/order/admin/stats", {
        headers: {
          Cookie: req.headers.cookie,
        },
      }),
    ]);

    let orderStats = {
      totalOrders: 0,
      totalRevenue: 0,
      statusCounts: {},
      recentOrders: [],
      orderGrowthPercentage: 0,
      revenueGrowthPercentage: 0,
    };

    if (orderResponse.ok) {
      const orderData = await orderResponse.json();
      orderStats = orderData.data;
    }

    const adminStats = {
      users: {
        total: userStats.totalUsers,
        customers: userStats.totalCustomers,
        admins: userStats.totalAdmins,
        recent: userStats.recentUsers,
        growthPercentage: userStats.userGrowthPercentage,
      },
      products: {
        total: productStats.totalProducts,
        active: productStats.activeProducts,
        inactive: productStats.inactiveProducts,
        featured: productStats.featuredProducts,
        new: productStats.newProducts,
        recent: productStats.recentProducts,
        categoryStats: productStats.categoryStats,
        growthPercentage: productStats.productGrowthPercentage,
      },
      orders: {
        ...orderStats,
        growthPercentage: orderStats.orderGrowthPercentage,
        revenueGrowthPercentage: orderStats.revenueGrowthPercentage,
      },
    };

    res.status(200).json({
      success: true,
      message: "Admin statistics retrieved successfully",
      data: adminStats,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching admin statistics",
    });
  }
});

// Recent Activity Route (optional - for future implementation)
router.get("/activity", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // This would combine recent orders, users, products, etc.
    // For now, return a placeholder response
    const recentActivity = [
      {
        type: "order",
        message: "New order #ORD-2024-001 received",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        icon: "shopping_cart",
      },
      {
        type: "user",
        message: "New customer registration",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        icon: "person_add",
      },
      {
        type: "product",
        message: "Product inventory updated",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        icon: "inventory",
      },
    ];

    res.status(200).json({
      success: true,
      message: "Recent activity retrieved successfully",
      data: recentActivity.slice(0, parseInt(limit)),
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching recent activity",
    });
  }
});

export default router;
