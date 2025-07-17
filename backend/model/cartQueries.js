import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Add item to cart (no stock deduction)
const addCart = async ({ userId, productId, size, color, quantity = 1 }) => {
  try {
    // Check if user exists
    const findUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!findUser) {
      throw new Error("User not found");
    }

    // Check if product exists
    const findProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!findProduct) {
      throw new Error("Product not found");
    }

    // Find the specific product variant to check if it exists
    const productVariant = await prisma.productVariant.findUnique({
      where: {
        productId_size_color: {
          productId,
          size,
          color,
        },
      },
    });

    if (!productVariant) {
      throw new Error("Product variant not found");
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_size_color: {
          userId,
          productId,
          size,
          color,
        },
      },
    });

    if (existingCartItem) {
      // Update quantity if item exists (no stock deduction)
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
        include: {
          product: true,
        },
      });

      return updatedCartItem;
    } else {
      // Create new cart item (no stock deduction)
      const newCartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          size,
          color,
          quantity,
        },
        include: {
          product: true,
        },
      });

      return newCartItem;
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

// Get all cart items for a user with current stock info
const getCart = async (userId) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            variants: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add current stock info to each cart item
    const cartItemsWithStock = cartItems.map((item) => {
      const variant = item.product.variants.find(
        (v) => v.size === item.size && v.color === item.color
      );

      return {
        ...item,
        currentStock: variant ? variant.stock : 0,
        isAvailable: variant ? variant.stock > 0 : false,
      };
    });

    return cartItemsWithStock;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

// Update cart item quantity (no stock operations)
const updateCart = async ({ cartItemId, quantity }) => {
  try {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        product: {
          include: {
            variants: true,
          },
        },
      },
    });

    // Add current stock info
    const variant = updatedCartItem.product.variants.find(
      (v) =>
        v.size === updatedCartItem.size && v.color === updatedCartItem.color
    );

    return {
      ...updatedCartItem,
      currentStock: variant ? variant.stock : 0,
      isAvailable: variant ? variant.stock > 0 : false,
    };
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

// Delete specific cart item (no stock operations)
const deleteCart = async (cartItemId) => {
  try {
    const deletedCartItem = await prisma.cartItem.delete({
      where: { id: cartItemId },
      include: {
        product: true,
      },
    });

    return deletedCartItem;
  } catch (error) {
    console.error("Error deleting cart item:", error);
    throw error;
  }
};

// Clear all cart items for a user (no stock operations)
const clearCart = async (userId) => {
  try {
    const deletedCount = await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return deletedCount;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

// Get cart item count
const getCartItemCount = async (userId) => {
  try {
    const count = await prisma.cartItem.aggregate({
      where: { userId },
      _sum: {
        quantity: true,
      },
    });
    return count._sum.quantity || 0;
  } catch (error) {
    console.error("Error getting cart item count:", error);
    throw error;
  }
};

// Get cart total with availability check
const getCartTotal = async (userId) => {
  try {
    const cartItems = await getCart(userId);

    // Separate available and unavailable items
    const availableItems = cartItems.filter((item) => item.isAvailable);
    const unavailableItems = cartItems.filter((item) => !item.isAvailable);

    // Calculate total for available items only
    const subtotal = availableItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const totalItemCount = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const availableItemCount = availableItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return {
      subtotal,
      totalItemCount,
      availableItemCount,
      availableItems,
      unavailableItems,
      items: cartItems,
    };
  } catch (error) {
    console.error("Error calculating cart total:", error);
    throw error;
  }
};

export {
  addCart,
  getCart,
  updateCart,
  deleteCart,
  clearCart,
  getCartItemCount,
  getCartTotal,
};
