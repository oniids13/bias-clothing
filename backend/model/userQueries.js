import { PrismaClient } from "@prisma/client";

import { validPassword } from "../utils/passwordUtil.js";

const prisma = new PrismaClient();

const createUser = async (name, email, salt, hash, googleId = null) => {
  try {
    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // If googleId is provided, check if it's already in use
    if (googleId) {
      const existingGoogleUser = await prisma.user.findFirst({
        where: { googleId },
      });

      if (existingGoogleUser) {
        throw new Error("User with this Google account already exists");
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        salt,
        hash,
        googleId, // Will be null for local registration, or the Google ID for OAuth
        role: "CUSTOMER", // Default role for locally registered users
      },
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const getUserLogin = async (email, password) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isValid = validPassword(password, user.hash, user.salt);

    if (isValid) {
      return {
        success: true,
        message: "User logged in successfully",
        user: user,
      };
    } else {
      return { success: false, message: "Invalid password" };
    }
  } catch (error) {
    console.error("Error getting user login:", error);
    throw error;
  }
};

// Get user with addresses
const getUserWithAddresses = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          orderBy: {
            isDefault: "desc", // Default address first
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error getting user with addresses:", error);
    throw error;
  }
};

// Update user phone number
const updateUserPhone = async (userId, phone) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { phone },
    });

    return user;
  } catch (error) {
    console.error("Error updating user phone:", error);
    throw error;
  }
};

// Add new address
const addAddress = async (userId, addressData) => {
  try {
    const {
      street,
      barangay,
      city,
      state,
      zipCode,
      country = "Philippines",
      isDefault = false,
    } = addressData;

    // If this is set as default, unset all other default addresses for this user
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        street,
        barangay,
        city,
        state,
        zipCode,
        country,
        isDefault,
      },
    });

    return address;
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};

// Update address
const updateAddress = async (addressId, userId, addressData) => {
  try {
    const { street, barangay, city, state, zipCode, country, isDefault } =
      addressData;

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      throw new Error("Address not found or does not belong to user");
    }

    // If this is set as default, unset all other default addresses for this user
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: {
        street,
        barangay,
        city,
        state,
        zipCode,
        country,
        isDefault,
      },
    });

    return address;
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

// Delete address
const deleteAddress = async (addressId, userId) => {
  try {
    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      throw new Error("Address not found or does not belong to user");
    }

    const address = await prisma.address.delete({
      where: { id: addressId },
    });

    return address;
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};

// Set default address
const setDefaultAddress = async (addressId, userId) => {
  try {
    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      throw new Error("Address not found or does not belong to user");
    }

    // Unset all other default addresses for this user
    await prisma.address.updateMany({
      where: { userId, id: { not: addressId } },
      data: { isDefault: false },
    });

    // Set this address as default
    const address = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return address;
  } catch (error) {
    console.error("Error setting default address:", error);
    throw error;
  }
};

// Admin-specific user queries
const getUserCount = async (options = {}) => {
  try {
    const { role, excludeRole } = options;
    const where = {};

    if (role) {
      where.role = role;
    }

    if (excludeRole) {
      where.role = { not: excludeRole };
    }

    const count = await prisma.user.count({ where });
    return count;
  } catch (error) {
    console.error("Error getting user count:", error);
    throw error;
  }
};

const getAllUsers = async (options = {}) => {
  try {
    const { page = 1, limit = 20, role, search } = options;
    const skip = (page - 1) * limit;

    const where = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

const getUserStats = async (dateRange = {}) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers,
      totalCustomers,
      totalAdmins,
      recentUsers,
      currentMonthUsers,
      previousMonthUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      // Current month users
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          createdAt: {
            gte: currentMonthStart,
          },
        },
      }),
      // Previous month users
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          createdAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
      }),
    ]);

    // Calculate growth percentage
    const userGrowthPercentage =
      previousMonthUsers > 0
        ? ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100
        : currentMonthUsers > 0
        ? 100
        : 0;

    return {
      totalUsers,
      totalCustomers,
      totalAdmins,
      recentUsers,
      currentMonthUsers,
      previousMonthUsers,
      userGrowthPercentage: Math.round(userGrowthPercentage * 100) / 100, // Round to 2 decimal places
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
};

export {
  createUser,
  getUserLogin,
  getUserWithAddresses,
  updateUserPhone,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  // Admin functions
  getUserCount,
  getAllUsers,
  getUserStats,
};
