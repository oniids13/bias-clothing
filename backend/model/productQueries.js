import { PrismaClient } from "@prisma/client";
import {
  deleteMultipleImages,
  getPublicIdFromUrl,
} from "../services/cloudinary.js";

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

// Admin-specific product queries
const getProductCount = async (options = {}) => {
  try {
    const { isActive, category } = options;
    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (category) {
      where.category = category;
    }

    const count = await prisma.product.count({ where });
    return count;
  } catch (error) {
    console.error("Error getting product count:", error);
    throw error;
  }
};

const getProductStats = async () => {
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
      totalProducts,
      activeProducts,
      inactiveProducts,
      featuredProducts,
      newProducts,
      recentProducts,
      categoryStats,
      totalVariants,
      outOfStockVariants,
      currentMonthProducts,
      previousMonthProducts,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: false } }),
      prisma.product.count({ where: { isFeatured: true } }),
      prisma.product.count({ where: { isNew: true } }),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          category: true,
          price: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.product.groupBy({
        by: ["category"],
        _count: { category: true },
      }),
      prisma.productVariant.count(),
      prisma.productVariant.count({ where: { stock: 0 } }),
      // Current month products
      prisma.product.count({
        where: {
          createdAt: {
            gte: currentMonthStart,
          },
        },
      }),
      // Previous month products
      prisma.product.count({
        where: {
          createdAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
      }),
    ]);

    // Calculate growth percentage
    const productGrowthPercentage =
      previousMonthProducts > 0
        ? ((currentMonthProducts - previousMonthProducts) /
            previousMonthProducts) *
          100
        : currentMonthProducts > 0
        ? 100
        : 0;

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      featuredProducts,
      newProducts,
      recentProducts,
      categoryStats: categoryStats.reduce((acc, item) => {
        acc[item.category] = item._count.category;
        return acc;
      }, {}),
      totalVariants,
      outOfStockVariants,
      inStockVariants: totalVariants - outOfStockVariants,
      currentMonthProducts,
      previousMonthProducts,
      productGrowthPercentage: Math.round(productGrowthPercentage * 100) / 100,
    };
  } catch (error) {
    console.error("Error fetching product stats:", error);
    throw error;
  }
};

const getAllProductsForAdmin = async (options = {}) => {
  try {
    const { page = 1, limit = 20, category, isActive, search } = options;
    const skip = (page - 1) * limit;

    const where = {};
    if (category) {
      where.category = category;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          variants: {
            select: {
              id: true,
              size: true,
              color: true,
              stock: true,
              sku: true,
            },
          },
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching all products for admin:", error);
    throw error;
  }
};

// New CRUD functions for admin

const createProduct = async (productData) => {
  try {
    const { variants, ...productInfo } = productData;

    // Create the product first
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        variants: {
          create: variants.map((variant) => ({
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            sku: variant.sku,
          })),
        },
      },
      include: {
        variants: {
          orderBy: [{ size: "asc" }, { color: "asc" }],
        },
      },
    });

    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Helper function to clean up removed images during product updates
const cleanupRemovedImages = async (oldImageUrls, newImageUrls) => {
  try {
    if (!oldImageUrls || !newImageUrls) return;

    // Find images that were removed (exist in old but not in new)
    const removedImageUrls = oldImageUrls.filter(
      (oldUrl) => !newImageUrls.includes(oldUrl)
    );

    if (removedImageUrls.length > 0) {
      console.log(
        `Cleaning up ${removedImageUrls.length} removed images from Cloudinary`
      );

      // Extract public IDs for the removed images
      const publicIdsToDelete = removedImageUrls
        .map((url) => getPublicIdFromUrl(url))
        .filter((publicId) => publicId !== null);

      if (publicIdsToDelete.length > 0) {
        try {
          const cloudinaryResult = await deleteMultipleImages(
            publicIdsToDelete
          );
          console.log(
            `Removed images cleanup: ${cloudinaryResult.successful} successful, ${cloudinaryResult.failed} failed`
          );
        } catch (error) {
          console.error("Error cleaning up removed images:", error);
          // Don't fail the update operation due to image cleanup errors
        }
      }
    }
  } catch (error) {
    console.error("Error in cleanupRemovedImages:", error);
  }
};

const updateProduct = async (productId, updateData) => {
  try {
    const { variants, ...productInfo } = updateData;

    // Get the current product to check for image changes
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { imageUrl: true },
    });

    // Start a transaction to update product and variants
    const result = await prisma.$transaction(async (prisma) => {
      // Update the product
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: productInfo,
      });

      // Handle variants if provided
      if (variants && variants.length > 0) {
        // Delete all existing variants
        await prisma.productVariant.deleteMany({
          where: { productId: productId },
        });

        // Create new variants
        await prisma.productVariant.createMany({
          data: variants.map((variant) => ({
            productId: productId,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            sku: variant.sku,
          })),
        });
      }

      // Return the updated product with variants
      return await prisma.product.findUnique({
        where: { id: productId },
        include: {
          variants: {
            orderBy: [{ size: "asc" }, { color: "asc" }],
          },
        },
      });
    });

    // Clean up removed images after successful database update
    if (currentProduct && productInfo.imageUrl) {
      await cleanupRemovedImages(currentProduct.imageUrl, productInfo.imageUrl);
    }

    return result;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

const deleteProduct = async (productId) => {
  try {
    // First, get the product with its images before deleting
    const productToDelete = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
      },
    });

    if (!productToDelete) {
      throw new Error("Product not found");
    }

    // Extract public IDs from image URLs for Cloudinary deletion
    const publicIds = [];
    if (productToDelete.imageUrl && productToDelete.imageUrl.length > 0) {
      productToDelete.imageUrl.forEach((url) => {
        const publicId = getPublicIdFromUrl(url);
        if (publicId) {
          publicIds.push(publicId);
        }
      });
    }

    // Delete images from Cloudinary first (if any exist)
    if (publicIds.length > 0) {
      try {
        console.log(
          `Deleting ${publicIds.length} images from Cloudinary for product: ${productToDelete.name}`
        );
        const cloudinaryResult = await deleteMultipleImages(publicIds);
        console.log(
          `Cloudinary deletion completed: ${cloudinaryResult.successful} successful, ${cloudinaryResult.failed} failed`
        );

        // Log any failed deletions for monitoring (but don't fail the entire operation)
        if (cloudinaryResult.failed > 0) {
          console.warn(
            `Warning: ${cloudinaryResult.failed} images failed to delete from Cloudinary`
          );
        }
      } catch (cloudinaryError) {
        // Log the error but don't fail the product deletion
        console.error(
          "Error deleting images from Cloudinary:",
          cloudinaryError
        );
        console.log(
          "Continuing with product deletion despite Cloudinary error"
        );
      }
    }

    // Delete the product from database (variants will be deleted automatically due to cascade)
    const deletedProduct = await prisma.product.delete({
      where: { id: productId },
      include: {
        variants: true,
      },
    });

    console.log(
      `Product "${deletedProduct.name}" and its images deleted successfully`
    );
    return deletedProduct;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

const getSingleProductForAdmin = async (productId) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          orderBy: [{ size: "asc" }, { color: "asc" }],
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    return product;
  } catch (error) {
    console.error("Error fetching single product for admin:", error);
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
  // Admin functions
  getProductCount,
  getProductStats,
  getAllProductsForAdmin,
  // New exports
  createProduct,
  updateProduct,
  deleteProduct,
  getSingleProductForAdmin,
};
