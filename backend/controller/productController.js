import {
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
} from "../model/productQueries.js";

const getAllProductsController = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching products",
    });
  }
};

const getFeaturedProductsController = async (req, res) => {
  try {
    const products = await getFeaturedProducts();
    res.status(200).json({
      success: true,
      message: "Featured products retrieved successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching featured products",
    });
  }
};

const getNewProductsController = async (req, res) => {
  try {
    const products = await getNewProducts();
    res.status(200).json({
      success: true,
      message: "New products retrieved successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching new products:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching new products",
    });
  }
};

const getActiveProductsController = async (req, res) => {
  try {
    const products = await getActiveProducts();
    res.status(200).json({
      success: true,
      message: "Active products retrieved successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching active products:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching active products",
    });
  }
};

const getInactiveProductsController = async (req, res) => {
  try {
    const products = await getAllProducts();
    // Filter inactive products (isActive = false)
    const inactiveProducts = products.filter((product) => !product.isActive);
    res.status(200).json({
      success: true,
      message: "Inactive products retrieved successfully",
      data: inactiveProducts,
    });
  } catch (error) {
    console.error("Error fetching inactive products:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching inactive products",
    });
  }
};

const getSingleProductController = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await getSingleProduct(slug);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error fetching single product:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching product",
    });
  }
};

// New stock-related controllers
const getProductColorsController = async (req, res) => {
  try {
    const { productId } = req.params;
    const colors = await getProductColors(productId);
    res.status(200).json({ colors });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product colors" });
  }
};

const getProductSizesController = async (req, res) => {
  try {
    const { productId } = req.params;
    const sizes = await getProductSizes(productId);
    res.status(200).json({ sizes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product sizes" });
  }
};

const getAvailableColorsForSizeController = async (req, res) => {
  try {
    const { productId, size } = req.params;
    const colors = await getAvailableColorsForSize(productId, size);
    res.status(200).json({ colors });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching available colors for size" });
  }
};

const getAvailableSizesForColorController = async (req, res) => {
  try {
    const { productId, color } = req.params;
    const sizes = await getAvailableSizesForColor(productId, color);
    res.status(200).json({ sizes });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching available sizes for color" });
  }
};

const getVariantStockController = async (req, res) => {
  try {
    const { productId, size, color } = req.params;
    const stock = await getVariantStock(productId, size, color);
    res.status(200).json({ stock });
  } catch (error) {
    res.status(500).json({ message: "Error fetching variant stock" });
  }
};

// Combined controller for getting all variant options for a product
const getProductVariantOptionsController = async (req, res) => {
  try {
    const { productId } = req.params;

    const [colors, sizes, product] = await Promise.all([
      getProductColors(productId),
      getProductSizes(productId),
      getSingleProduct(productId), // This might need to be adjusted based on your needs
    ]);

    res.status(200).json({
      colors,
      sizes,
      productId,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product variant options" });
  }
};

// Controller for checking variant availability
const checkVariantAvailabilityController = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, color } = req.query;

    if (!size || !color) {
      return res.status(400).json({
        message: "Size and color are required query parameters",
      });
    }

    const stock = await getVariantStock(productId, size, color);
    const isAvailable = stock > 0;

    res.status(200).json({
      available: isAvailable,
      stock: stock,
      size: size,
      color: color,
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking variant availability" });
  }
};

// Admin Controllers
const getProductCountController = async (req, res) => {
  try {
    const { isActive, category } = req.query;

    const options = {};
    if (isActive !== undefined) {
      options.isActive = isActive === "true";
    }
    if (category) {
      options.category = category;
    }

    const count = await getProductCount(options);

    res.status(200).json({
      success: true,
      message: "Product count retrieved successfully",
      count,
      data: { productCount: count },
    });
  } catch (error) {
    console.error("Error fetching product count:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching product count",
    });
  }
};

const getProductStatsController = async (req, res) => {
  try {
    const stats = await getProductStats();

    res.status(200).json({
      success: true,
      message: "Product statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching product statistics:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching product statistics",
    });
  }
};

const getAllProductsForAdminController = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, isActive, search } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      search,
    };

    if (isActive !== undefined) {
      options.isActive = isActive === "true";
    }

    const result = await getAllProductsForAdmin(options);

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching products for admin:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching products",
    });
  }
};

export {
  getAllProductsController,
  getFeaturedProductsController,
  getNewProductsController,
  getActiveProductsController,
  getInactiveProductsController,
  getSingleProductController,
  getProductColorsController,
  getProductSizesController,
  getAvailableColorsForSizeController,
  getAvailableSizesForColorController,
  getVariantStockController,
  getProductVariantOptionsController,
  checkVariantAvailabilityController,
  // Admin controllers
  getProductCountController,
  getProductStatsController,
  getAllProductsForAdminController,
};
