import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getAllProducts = async () => {
  try {
    const products = await prisma.product.findMany({});
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
    });
    return products;
  } catch (error) {
    console.error("Error fetching new products:", error);
    throw error;
  }
};

const getSingleProduct = async (slug) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
    });
    return product;
  } catch (error) {
    console.error("Error fetching single product:", error);
    throw error;
  }
};

export {
  getAllProducts,
  getFeaturedProducts,
  getNewProducts,
  getSingleProduct,
};
