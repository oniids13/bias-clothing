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
import {
  getCompleteAdminStatsController,
  getRecentActivityController,
  getBasicAdminStatsController,
  getAdminDashboardController,
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

// Admin Dashboard Routes
router.get(
  "/stats",
  requireAuth,
  requireAdmin,
  getCompleteAdminStatsController
);
router.get("/activity", requireAuth, requireAdmin, getRecentActivityController);
router.get(
  "/basic-stats",
  requireAuth,
  requireAdmin,
  getBasicAdminStatsController
);
router.get(
  "/dashboard",
  requireAuth,
  requireAdmin,
  getAdminDashboardController
);

export default router;
