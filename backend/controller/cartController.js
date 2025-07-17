import {
  addCart,
  getCart,
  updateCart,
  deleteCart,
  clearCart,
  getCartItemCount,
  getCartTotal,
} from "../model/cartQueries.js";

// Add item to cart
const addToCartController = async (req, res) => {
  try {
    const { productId, size, color, quantity } = req.body;
    const userId = req.user.id; // Get user ID from authenticated user

    // Validate required fields
    if (!productId || !size || !color) {
      return res.status(400).json({
        success: false,
        message: "Product ID, size, and color are required",
      });
    }

    if (quantity && quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const cartItem = await addCart({
      userId,
      productId,
      size,
      color,
      quantity: quantity || 1,
    });

    res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      cartItem,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error adding item to cart",
    });
  }
};

// Get user's cart
const getCartController = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated user

    const cartItems = await getCart(userId);
    res.status(200).json({
      success: true,
      cartItems,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
    });
  }
};

// Update cart item quantity
const updateCartController = async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;

    if (!cartItemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Cart item ID and quantity are required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const updatedCartItem = await updateCart({ cartItemId, quantity });
    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      cartItem: updatedCartItem,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating cart item",
    });
  }
};

// Remove item from cart
const removeFromCartController = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    if (!cartItemId) {
      return res.status(400).json({
        success: false,
        message: "Cart item ID is required",
      });
    }

    const deletedCartItem = await deleteCart(cartItemId);
    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      cartItem: deletedCartItem,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error removing item from cart",
    });
  }
};

// Clear entire cart
const clearCartController = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated user

    const result = await clearCart(userId);
    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
    });
  }
};

// Get cart item count
const getCartItemCountController = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated user

    const count = await getCartItemCount(userId);
    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error getting cart item count:", error);
    res.status(500).json({
      success: false,
      message: "Error getting cart item count",
    });
  }
};

// Get cart total
const getCartTotalController = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated user

    const cartTotal = await getCartTotal(userId);
    res.status(200).json({
      success: true,
      ...cartTotal,
    });
  } catch (error) {
    console.error("Error getting cart total:", error);
    res.status(500).json({
      success: false,
      message: "Error getting cart total",
    });
  }
};

export {
  addToCartController,
  getCartController,
  updateCartController,
  removeFromCartController,
  clearCartController,
  getCartItemCountController,
  getCartTotalController,
};
