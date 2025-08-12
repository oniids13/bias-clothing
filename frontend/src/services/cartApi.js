import { apiFetch } from "./httpClient";

// Cart API functions
export const cartApi = {
  // Add item to cart
  addToCart: async (productId, size, color, quantity = 1) => {
    try {
      return await apiFetch(`/cart/add`, {
        method: "POST",
        body: { productId, size, color, quantity },
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  },

  // Get user's cart
  getCart: async () => {
    try {
      return await apiFetch(`/cart`, {});
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (cartItemId, quantity) => {
    try {
      return await apiFetch(`/cart/update`, {
        method: "PUT",
        body: { cartItemId, quantity },
      });
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (cartItemId) => {
    try {
      return await apiFetch(`/cart/remove/${cartItemId}`, { method: "DELETE" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      return await apiFetch(`/cart/clear`, { method: "DELETE" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  },

  // Get cart item count
  getCartItemCount: async () => {
    try {
      return await apiFetch(`/cart/count`, {});
    } catch (error) {
      console.error("Error getting cart item count:", error);
      throw error;
    }
  },

  // Get cart total
  getCartTotal: async () => {
    try {
      return await apiFetch(`/cart/total`, {});
    } catch (error) {
      console.error("Error getting cart total:", error);
      throw error;
    }
  },
};

// Product stock API functions
export const stockApi = {
  // Get all colors for a product
  getProductColors: async (productId) => {
    try {
      return await apiFetch(`/product/${productId}/colors`);
    } catch (error) {
      console.error("Error fetching product colors:", error);
      throw error;
    }
  },

  // Get all sizes for a product
  getProductSizes: async (productId) => {
    try {
      return await apiFetch(`/product/${productId}/sizes`);
    } catch (error) {
      console.error("Error fetching product sizes:", error);
      throw error;
    }
  },

  // Get available colors for a specific size
  getAvailableColorsForSize: async (productId, size) => {
    try {
      return await apiFetch(`/product/${productId}/colors/${size}`);
    } catch (error) {
      console.error("Error fetching available colors for size:", error);
      throw error;
    }
  },

  // Get available sizes for a specific color
  getAvailableSizesForColor: async (productId, color) => {
    try {
      return await apiFetch(`/product/${productId}/sizes/${color}`);
    } catch (error) {
      console.error("Error fetching available sizes for color:", error);
      throw error;
    }
  },

  // Get stock for specific variant
  getVariantStock: async (productId, size, color) => {
    try {
      return await apiFetch(`/product/${productId}/stock/${size}/${color}`);
    } catch (error) {
      console.error("Error fetching variant stock:", error);
      throw error;
    }
  },

  // Check variant availability
  checkVariantAvailability: async (productId, size, color) => {
    try {
      return await apiFetch(
        `/product/${productId}/check-availability?size=${size}&color=${color}`
      );
    } catch (error) {
      console.error("Error checking variant availability:", error);
      throw error;
    }
  },

  // Get all variant options for a product
  getProductVariantOptions: async (productId) => {
    try {
      return await apiFetch(`/product/${productId}/variant-options`);
    } catch (error) {
      console.error("Error fetching product variant options:", error);
      throw error;
    }
  },
};
