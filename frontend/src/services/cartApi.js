const API_BASE_URL = "http://localhost:3000/api";

// Cart API functions
export const cartApi = {
  // Add item to cart
  addToCart: async (productId, size, color, quantity = 1) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for session authentication
        body: JSON.stringify({
          productId,
          size,
          color,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add item to cart");
      }

      return data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  },

  // Get user's cart
  getCart: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        credentials: "include", // Include cookies for session authentication
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch cart");
      }

      return data;
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (cartItemId, quantity) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for session authentication
        body: JSON.stringify({
          cartItemId,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update cart item");
      }

      return data;
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (cartItemId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/cart/remove/${cartItemId}`,
        {
          method: "DELETE",
          credentials: "include", // Include cookies for session authentication
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove item from cart");
      }

      return data;
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: "DELETE",
        credentials: "include", // Include cookies for session authentication
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to clear cart");
      }

      return data;
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  },

  // Get cart item count
  getCartItemCount: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/count`, {
        credentials: "include", // Include cookies for session authentication
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get cart item count");
      }

      return data;
    } catch (error) {
      console.error("Error getting cart item count:", error);
      throw error;
    }
  },

  // Get cart total
  getCartTotal: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/total`, {
        credentials: "include", // Include cookies for session authentication
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get cart total");
      }

      return data;
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
      const response = await fetch(
        `${API_BASE_URL}/product/${productId}/colors`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch product colors");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching product colors:", error);
      throw error;
    }
  },

  // Get all sizes for a product
  getProductSizes: async (productId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/product/${productId}/sizes`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch product sizes");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching product sizes:", error);
      throw error;
    }
  },

  // Get available colors for a specific size
  getAvailableColorsForSize: async (productId, size) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/product/${productId}/colors/${size}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available colors for size");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching available colors for size:", error);
      throw error;
    }
  },

  // Get available sizes for a specific color
  getAvailableSizesForColor: async (productId, color) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/product/${productId}/sizes/${color}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available sizes for color");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching available sizes for color:", error);
      throw error;
    }
  },

  // Get stock for specific variant
  getVariantStock: async (productId, size, color) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/product/${productId}/stock/${size}/${color}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch variant stock");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching variant stock:", error);
      throw error;
    }
  },

  // Check variant availability
  checkVariantAvailability: async (productId, size, color) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/product/${productId}/check-availability?size=${size}&color=${color}`
      );

      if (!response.ok) {
        throw new Error("Failed to check variant availability");
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking variant availability:", error);
      throw error;
    }
  },

  // Get all variant options for a product
  getProductVariantOptions: async (productId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/product/${productId}/variant-options`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch product variant options");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching product variant options:", error);
      throw error;
    }
  },
};
