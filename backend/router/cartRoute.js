import { Router } from "express";
import { checkAuth } from "../middleware/auth.js";
import {
  addToCartController,
  getCartController,
  updateCartController,
  removeFromCartController,
  clearCartController,
  getCartItemCountController,
  getCartTotalController,
} from "../controller/cartController.js";

const cartRouter = Router();

// All cart routes require authentication
cartRouter.use(checkAuth);

// Add item to cart
cartRouter.post("/add", addToCartController);

// Get user's cart
cartRouter.get("/", getCartController);

// Update cart item quantity
cartRouter.put("/update", updateCartController);

// Remove item from cart
cartRouter.delete("/remove/:cartItemId", removeFromCartController);

// Clear entire cart
cartRouter.delete("/clear", clearCartController);

// Get cart item count
cartRouter.get("/count", getCartItemCountController);

// Get cart total
cartRouter.get("/total", getCartTotalController);

export default cartRouter;
