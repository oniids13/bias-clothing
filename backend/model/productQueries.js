import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getAllProducts = async () => {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          orderBy: [{ size: "asc" }, { color: "asc" }],
        },
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

const getFeaturedProducts = async () => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      include: {
        variants: {
          orderBy: [{ size: "asc" }, { color: "asc" }],
        },
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    throw error;
  }
};

const getNewProducts = async () => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isNew: true,
        isActive: true,
      },
      include: {
        variants: {
          orderBy: [{ size: "asc" }, { color: "asc" }],
        },
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching new products:", error);
    throw error;
  }
};

const getActiveProducts = async () => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        variants: {
          orderBy: [{ size: "asc" }, { color: "asc" }],
        },
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching active products:", error);
    throw error;
  }
};

const getSingleProduct = async (slug) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        variants: {
          orderBy: [{ size: "asc" }, { color: "asc" }],
        },
      },
    });
    return product;
  } catch (error) {
    console.error("Error fetching single product:", error);
    throw error;
  }
};

// Helper function to get unique colors for a product
const getProductColors = async (productId) => {
  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      select: {
        color: true,
      },
      distinct: ["color"],
    });
    return variants.map((variant) => variant.color);
  } catch (error) {
    console.error("Error fetching product colors:", error);
    throw error;
  }
};

// Helper function to get unique sizes for a product
const getProductSizes = async (productId) => {
  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      select: {
        size: true,
      },
      distinct: ["size"],
      orderBy: { size: "asc" },
    });
    return variants.map((variant) => variant.size);
  } catch (error) {
    console.error("Error fetching product sizes:", error);
    throw error;
  }
};

// Helper function to get available colors for a specific size
const getAvailableColorsForSize = async (productId, size) => {
  try {
    const variants = await prisma.productVariant.findMany({
      where: {
        productId,
        size,
        stock: { gt: 0 }, // Only colors with stock > 0
      },
      select: {
        color: true,
        stock: true,
      },
    });
    return variants;
  } catch (error) {
    console.error("Error fetching available colors for size:", error);
    throw error;
  }
};

// Helper function to get available sizes for a specific color
const getAvailableSizesForColor = async (productId, color) => {
  try {
    const variants = await prisma.productVariant.findMany({
      where: {
        productId,
        color,
        stock: { gt: 0 }, // Only sizes with stock > 0
      },
      select: {
        size: true,
        stock: true,
      },
      orderBy: { size: "asc" },
    });
    return variants;
  } catch (error) {
    console.error("Error fetching available sizes for color:", error);
    throw error;
  }
};

// Helper function to check stock for specific variant
const getVariantStock = async (productId, size, color) => {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: {
        productId_size_color: {
          productId,
          size,
          color,
        },
      },
      select: {
        stock: true,
      },
    });
    return variant ? variant.stock : 0;
  } catch (error) {
    console.error("Error fetching variant stock:", error);
    throw error;
  }
};

export {
  getAllProducts,
  getFeaturedProducts,
  getNewProducts,
  getActiveProducts,
  getSingleProduct,
  getProductColors,
  getProductSizes,
  getAvailableColorsForSize,
  getAvailableSizesForColor,
  getVariantStock,
};
