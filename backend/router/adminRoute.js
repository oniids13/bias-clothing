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
  // New CRUD controllers
  createProductController,
  updateProductController,
  deleteProductController,
  getSingleProductForAdminController,
  uploadImageController,
  upload,
} from "../controller/productController.js";
import {
  getCompleteAdminStatsController,
  getRecentActivityController,
  getBasicAdminStatsController,
  getAdminDashboardController,
  getDashboardAnalyticsController,
  getInventoryDataController,
  updateVariantStockController,
  getInventoryAnalyticsController,
} from "../controller/adminController.js";
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

// Apply auth middleware to all admin routes
router.use(requireAuth, requireAdmin);

// Product Management Routes
router.get("/products/count", getProductCountController);

router.get("/products", getAllProductsForAdminController);

// New CRUD routes for products
router.post("/products", createProductController);

router.get("/products/:id", getSingleProductForAdminController);

router.put("/products/:id", updateProductController);

router.delete("/products/:id", deleteProductController);

// Image upload route
router.post(
  "/upload-image",
  upload.array("images", 4), // Allow up to 4 images
  uploadImageController
);

// Stats Routes
router.get("/stats", getCompleteAdminStatsController);
router.get("/basic-stats", getBasicAdminStatsController);
router.get("/dashboard", getAdminDashboardController);
router.get("/analytics", getDashboardAnalyticsController);

// Activity Routes
router.get("/activity", getRecentActivityController);

// User Management Routes
router.get("/users/count", getUserCountController);
router.get("/users/stats", getUserStatsController);
router.get("/users", getAllUsersController);

// Product Stats Routes
router.get("/products/stats", getProductStatsController);

// Inventory Management Routes
router.get("/inventory", getInventoryDataController);
router.put("/inventory/variant/:variantId", updateVariantStockController);
router.get("/inventory/analytics", getInventoryAnalyticsController);

export default router;
