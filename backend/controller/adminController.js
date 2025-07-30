import {
  getAdminStats,
  getRecentActivity,
  getAdminDashboardData,
  getDashboardAnalytics,
} from "../model/adminQueries.js";
import { getUserStats } from "../model/userQueries.js";
import {
  getProductStats,
  getAllProductsForAdmin,
} from "../model/productQueries.js";

// Get complete admin statistics with growth data
const getCompleteAdminStatsController = async (req, res) => {
  try {
    // Get all statistics for admin dashboard
    const [userStats, productStats, orderResponse] = await Promise.all([
      getUserStats(),
      getProductStats(),
      fetch("http://localhost:3000/api/order/admin/stats", {
        headers: {
          Cookie: req.headers.cookie || "",
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
};

// Get recent activity controller
const getRecentActivityController = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const activities = await getRecentActivity(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Recent activity retrieved successfully",
      data: activities,
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching recent activity",
      data: [],
    });
  }
};

// Get basic admin statistics controller
const getBasicAdminStatsController = async (req, res) => {
  try {
    const stats = await getAdminStats();

    res.status(200).json({
      success: true,
      message: "Basic admin statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching basic admin stats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching basic admin statistics",
    });
  }
};

// Get admin dashboard overview controller
const getAdminDashboardController = async (req, res) => {
  try {
    const dashboardData = await getAdminDashboardData();

    res.status(200).json({
      success: true,
      message: "Admin dashboard data retrieved successfully",
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching admin dashboard data",
    });
  }
};

// Get dashboard analytics controller
const getDashboardAnalyticsController = async (req, res) => {
  try {
    const analyticsData = await getDashboardAnalytics();

    res.status(200).json({
      success: true,
      message: "Dashboard analytics retrieved successfully",
      data: analyticsData,
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching dashboard analytics",
    });
  }
};

// Get inventory data controller
const getInventoryDataController = async (req, res) => {
  try {
    const result = await getAllProductsForAdmin();
    const products = result.products || [];

    // Calculate inventory statistics
    let totalProducts = products.length;
    let lowStockItems = 0;
    let outOfStockItems = 0;
    let totalValue = 0;
    let totalStock = 0;
    let variantCount = 0;

    products.forEach((product) => {
      product.variants.forEach((variant) => {
        variantCount++;
        totalStock += variant.stock;
        totalValue += variant.stock * product.price;

        if (variant.stock === 0) {
          outOfStockItems++;
        } else if (variant.stock <= 10) {
          lowStockItems++;
        }
      });
    });

    const averageStockLevel =
      variantCount > 0 ? Math.round(totalStock / variantCount) : 0;

    const inventoryStats = {
      totalProducts,
      lowStockItems,
      outOfStockItems,
      totalValue,
      averageStockLevel,
    };

    res.status(200).json({
      success: true,
      message: "Inventory data retrieved successfully",
      data: {
        products,
        stats: inventoryStats,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching inventory data",
    });
  }
};

// Update variant stock controller
const updateVariantStockController = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { stock, notes } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock level must be a non-negative number",
      });
    }

    // Import the updateVariantStock function from productQueries
    const { updateVariantStock } = await import("../model/productQueries.js");

    const updatedVariant = await updateVariantStock(variantId, stock, notes);

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: updatedVariant,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating stock",
    });
  }
};

// Get inventory analytics controller
const getInventoryAnalyticsController = async (req, res) => {
  try {
    const result = await getAllProductsForAdmin();
    const products = result.products || [];

    // Calculate analytics
    const stockTrends = [];
    const categoryDistribution = {};
    const lowStockAlerts = [];

    products.forEach((product) => {
      // Category distribution
      if (!categoryDistribution[product.category]) {
        categoryDistribution[product.category] = {
          totalProducts: 0,
          totalStock: 0,
          lowStockCount: 0,
        };
      }

      categoryDistribution[product.category].totalProducts++;

      product.variants.forEach((variant) => {
        categoryDistribution[product.category].totalStock += variant.stock;

        if (variant.stock <= 10 && variant.stock > 0) {
          categoryDistribution[product.category].lowStockCount++;
          lowStockAlerts.push({
            productName: product.name,
            variant: `${variant.size}/${variant.color}`,
            currentStock: variant.stock,
            sku: variant.sku,
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      message: "Inventory analytics retrieved successfully",
      data: {
        stockTrends,
        categoryDistribution,
        lowStockAlerts,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory analytics:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching inventory analytics",
    });
  }
};

export {
  getCompleteAdminStatsController,
  getRecentActivityController,
  getBasicAdminStatsController,
  getAdminDashboardController,
  getDashboardAnalyticsController,
  getInventoryDataController,
  updateVariantStockController,
  getInventoryAnalyticsController,
};
