import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Add item to cart or update quantity if exists
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

    // Find the specific product variant
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
      // Check if there's enough stock for the additional quantity
      if (productVariant.stock < quantity) {
        throw new Error(
          `Insufficient stock. Only ${productVariant.stock} items available.`
        );
      }

      // Update quantity in cart and deduct from stock
      const [updatedCartItem] = await prisma.$transaction([
        prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity + quantity,
          },
          include: {
            product: true,
          },
        }),
        prisma.productVariant.update({
          where: { id: productVariant.id },
          data: {
            stock: productVariant.stock - quantity,
          },
        }),
      ]);

      return updatedCartItem;
    } else {
      // Check if there's enough stock for the new item
      if (productVariant.stock < quantity) {
        throw new Error(
          `Insufficient stock. Only ${productVariant.stock} items available.`
        );
      }

      // Create new cart item and deduct from stock
      const [newCartItem] = await prisma.$transaction([
        prisma.cartItem.create({
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
        }),
        prisma.productVariant.update({
          where: { id: productVariant.id },
          data: {
            stock: productVariant.stock - quantity,
          },
        }),
      ]);

      return newCartItem;
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

// Get all cart items for a user
const getCart = async (userId) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return cartItems;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

// Update cart item quantity
const updateCart = async ({ cartItemId, quantity }) => {
  try {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // Get the current cart item
    const currentCartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        product: true,
      },
    });

    if (!currentCartItem) {
      throw new Error("Cart item not found");
    }

    // Get the product variant
    const productVariant = await prisma.productVariant.findUnique({
      where: {
        productId_size_color: {
          productId: currentCartItem.productId,
          size: currentCartItem.size,
          color: currentCartItem.color,
        },
      },
    });

    if (!productVariant) {
      throw new Error("Product variant not found");
    }

    const quantityDifference = quantity - currentCartItem.quantity;

    if (quantityDifference > 0) {
      // Increasing quantity - check if there's enough stock
      if (productVariant.stock < quantityDifference) {
        throw new Error(
          `Insufficient stock. Only ${productVariant.stock} additional items available.`
        );
      }

      // Update cart item and deduct additional stock
      const [updatedCartItem] = await prisma.$transaction([
        prisma.cartItem.update({
          where: { id: cartItemId },
          data: { quantity },
          include: {
            product: true,
          },
        }),
        prisma.productVariant.update({
          where: { id: productVariant.id },
          data: {
            stock: productVariant.stock - quantityDifference,
          },
        }),
      ]);

      return updatedCartItem;
    } else if (quantityDifference < 0) {
      // Decreasing quantity - add stock back
      const [updatedCartItem] = await prisma.$transaction([
        prisma.cartItem.update({
          where: { id: cartItemId },
          data: { quantity },
          include: {
            product: true,
          },
        }),
        prisma.productVariant.update({
          where: { id: productVariant.id },
          data: {
            stock: productVariant.stock + Math.abs(quantityDifference),
          },
        }),
      ]);

      return updatedCartItem;
    } else {
      // No quantity change
      return currentCartItem;
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

// Delete specific cart item
const deleteCart = async (cartItemId) => {
  try {
    // Get the cart item first
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    // Get the product variant
    const productVariant = await prisma.productVariant.findUnique({
      where: {
        productId_size_color: {
          productId: cartItem.productId,
          size: cartItem.size,
          color: cartItem.color,
        },
      },
    });

    if (!productVariant) {
      throw new Error("Product variant not found");
    }

    // Delete cart item and restore stock
    const [deletedCartItem] = await prisma.$transaction([
      prisma.cartItem.delete({
        where: { id: cartItemId },
        include: {
          product: true,
        },
      }),
      prisma.productVariant.update({
        where: { id: productVariant.id },
        data: {
          stock: productVariant.stock + cartItem.quantity,
        },
      }),
    ]);

    return deletedCartItem;
  } catch (error) {
    console.error("Error deleting cart item:", error);
    throw error;
  }
};

// Clear all cart items for a user
const clearCart = async (userId) => {
  try {
    // Get all cart items for the user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
    });

    // Restore stock for all items
    const stockUpdates = [];
    for (const cartItem of cartItems) {
      const productVariant = await prisma.productVariant.findUnique({
        where: {
          productId_size_color: {
            productId: cartItem.productId,
            size: cartItem.size,
            color: cartItem.color,
          },
        },
      });

      if (productVariant) {
        stockUpdates.push(
          prisma.productVariant.update({
            where: { id: productVariant.id },
            data: {
              stock: productVariant.stock + cartItem.quantity,
            },
          })
        );
      }
    }

    // Execute all updates in a transaction
    const deletedCount = await prisma.$transaction([
      prisma.cartItem.deleteMany({
        where: { userId },
      }),
      ...stockUpdates,
    ]);

    return deletedCount[0]; // Return the delete count
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

// Get cart item count for a user
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

// Get cart total for a user
const getCartTotal = async (userId) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });

    const total = cartItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    return {
      subtotal: total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
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
