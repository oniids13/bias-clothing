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

export { createUser, getUserLogin };
