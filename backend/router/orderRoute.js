import express from "express";
import {
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

  // Stock management controllers
  checkStockController,
  getLowStockController,
  getVariantStockController,

  // Order item controllers
  createOrderItemController,
  getOrderItemsByOrderController,
  getOrderItemByIdController,
  updateOrderItemController,
  deleteOrderItemController,
} from "../controller/orderController.js";

import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ============================================
// ORDER ROUTES
// ============================================

// SPECIFIC ROUTES FIRST (to avoid route conflicts)

// Get order statistics (Protected - Admin only)
router.get("/admin/stats", requireAuth, getOrderStatsController);

// Get all orders with pagination and search (Protected - Admin only)
router.get("/admin/all", requireAuth, getAllOrdersController);

// Get orders by user ID (Protected - User must be authenticated)
router.get("/user/:userId", requireAuth, getOrdersByUserController);

// GENERAL ROUTES SECOND

// Create a new order (Protected - User must be authenticated)
router.post("/", requireAuth, createOrderController);

// Get order by ID (Protected - User must be authenticated)
router.get("/:orderId", requireAuth, getOrderByIdController);

// Update order status (Protected - Admin only)
router.patch("/:orderId/status", requireAuth, updateOrderStatusController);

// Update payment status (Protected - Admin or System)
router.patch("/:orderId/payment", requireAuth, updatePaymentStatusController);

// Update tracking number (Protected - Admin only)
router.patch("/:orderId/tracking", requireAuth, updateTrackingNumberController);

// Cancel/Delete order (Protected - User can cancel own orders, Admin can cancel any)
router.delete("/:orderId", requireAuth, deleteOrderController);

// ============================================
// STOCK MANAGEMENT ROUTES
// ============================================

// Check stock availability for items (Protected - User must be authenticated)
router.post("/stock/check", requireAuth, checkStockController);

// Get low stock items (Protected - Admin only)
router.get("/stock/low", requireAuth, getLowStockController);

// Get stock for specific product variant (Protected - User must be authenticated)
router.get(
  "/stock/:productId/:size/:color",
  requireAuth,
  getVariantStockController
);

// ============================================
// ORDER ITEM ROUTES
// ============================================

// Create order item (Protected - Admin only, typically done during order creation)
router.post("/items", requireAuth, createOrderItemController);

// Get order items by order ID (Protected - User must be authenticated)
router.get("/:orderId/items", requireAuth, getOrderItemsByOrderController);

// Get order item by ID (Protected - User must be authenticated)
router.get("/items/:orderItemId", requireAuth, getOrderItemByIdController);

// Update order item (Protected - Admin only)
router.patch("/items/:orderItemId", requireAuth, updateOrderItemController);

// Delete order item (Protected - Admin only)
router.delete("/items/:orderItemId", requireAuth, deleteOrderItemController);

export default router;
