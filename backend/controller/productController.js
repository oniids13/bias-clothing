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
} from "../model/productQueries.js";

const getActiveProductsController = async (req, res) => {
  try {
    const products = await getActiveProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching active products" });
  }
};

const getInactiveProductsController = async (req, res) => {
  try {
    const products = await getAllProducts();
    const inactiveProducts = products.filter((product) => !product.isActive);
    res.status(200).json(inactiveProducts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inactive products" });
  }
};

const getFeaturedProductsController = async (req, res) => {
  try {
    const products = await getFeaturedProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching featured products" });
  }
};

const getNewProductsController = async (req, res) => {
  try {
    const products = await getNewProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching new products" });
  }
};

const getSingleProductController = async (req, res) => {
  try {
    const product = await getSingleProduct(req.params.slug);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching single product" });
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

export {
  getActiveProductsController,
  getInactiveProductsController,
  getFeaturedProductsController,
  getNewProductsController,
  getSingleProductController,
  getProductColorsController,
  getProductSizesController,
  getAvailableColorsForSizeController,
  getAvailableSizesForColorController,
  getVariantStockController,
  getProductVariantOptionsController,
  checkVariantAvailabilityController,
};
