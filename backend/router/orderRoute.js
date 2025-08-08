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
  cancelOrderController,

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

  // PayMongo integration controllers
  createPaymentIntentController,
  createPaymentMethodController,
  getPaymentIntentController,
  createOrderWithPaymentController,
  handlePaymentSuccessController,
  attachPaymentMethodController,
  createCheckoutSessionController,
  getCheckoutSessionController,

  // Redirect controller helpers
  paymentRedirectController,
  paymentSourceRedirectController,
  reinitiatePaymentForOrderController,
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

// Cancel order (for customers - only pending orders)
router.put("/:orderId/cancel", requireAuth, cancelOrderController);

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

// ============================================
// PAYMONGO INTEGRATION ROUTES
// ============================================

// Create PayMongo Payment Intent (Protected - User must be authenticated)
router.post("/payment/intent", requireAuth, createPaymentIntentController);

// Create PayMongo Payment Method for cards (Protected - User must be authenticated)
router.post("/payment/method", requireAuth, createPaymentMethodController);

// Attach Payment Method to Payment Intent (Protected - User must be authenticated)
router.post("/payment/attach", requireAuth, attachPaymentMethodController);

// Get Payment Intent status (Protected - User must be authenticated)
router.get(
  "/payment/intent/:paymentIntentId",
  requireAuth,
  getPaymentIntentController
);

// Create PayMongo Checkout Session (Protected - User must be authenticated)
router.post("/payment/checkout", requireAuth, createCheckoutSessionController);

// Get Checkout Session status (Protected - User must be authenticated)
router.get(
  "/payment/checkout/:checkoutSessionId",
  requireAuth,
  getCheckoutSessionController
);

// Create Order with PayMongo Payment Processing (Protected - User must be authenticated)
router.post("/payment/create", requireAuth, createOrderWithPaymentController);

// Handle Payment Success/Webhook (This might need to be unprotected for webhooks)
router.post("/payment/success", handlePaymentSuccessController);

// Handle Payment Success (Protected version for frontend callbacks)
router.post("/payment/confirm", requireAuth, handlePaymentSuccessController);

// Unified redirect endpoint for PayMongo (success/failed/expired)
// Example usage from PayMongo redirect settings:
//   success:  GET /api/order/payment/redirect?success=true&order_id={ORDER_ID}
//   failed:   GET /api/order/payment/redirect?status=failed&order_id={ORDER_ID}
//   expired:  GET /api/order/payment/redirect?status=expired&order_id={ORDER_ID}
router.get("/payment/redirect", paymentRedirectController);

// Redirect endpoint that accepts PayMongo Source ID and bounces user back
// Configure PayMongo (sources redirect failed/success) to this endpoint:
//   GET /api/order/payment/source-redirect?id={SOURCE_ID}
router.get("/payment/source-redirect", paymentSourceRedirectController);

// Re-initiate payment for an existing order (user must be authenticated and owner)
router.post(
  "/:orderId/reinitiate-payment",
  requireAuth,
  reinitiatePaymentForOrderController
);

export default router;
