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
  // New CRUD functions
  createProduct,
  updateProduct,
  deleteProduct,
  getSingleProductForAdmin,
} from "../model/productQueries.js";

import { uploadImage, cloudinary } from "../services/cloudinary.js";
import { createSlug } from "../utils/slugify.js";
import multer from "multer";

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
});

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

// New Admin CRUD Controllers

const createProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      details,
      imageUrl,
      price,
      category,
      isActive,
      isFeatured,
      isNew,
      variants,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !variants ||
      variants.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, description, price, category, and variants",
      });
    }

    // Generate slug from product name
    const slug = createSlug(name);

    // Prepare product data
    const productData = {
      name: name.trim(),
      description: description.trim(),
      details: details || [],
      imageUrl: imageUrl || [],
      price: parseFloat(price),
      category,
      slug,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      isNew: isNew !== undefined ? isNew : true,
      variants: variants.map((variant) => ({
        size: variant.size,
        color: variant.color.trim(),
        stock: parseInt(variant.stock) || 0,
        sku: `${slug}-${variant.size}-${variant.color
          .toLowerCase()
          .replace(/\s+/g, "-")}`,
      })),
    };

    const result = await createProduct(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating product",
    });
  }
};

const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      details,
      imageUrl,
      price,
      category,
      isActive,
      isFeatured,
      isNew,
      variants,
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, description, price, category",
      });
    }

    // Generate new slug if name changed
    const slug = createSlug(name);

    // Prepare update data
    const updateData = {
      name: name.trim(),
      description: description.trim(),
      details: details || [],
      imageUrl: imageUrl || [],
      price: parseFloat(price),
      category,
      slug,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      isNew: isNew !== undefined ? isNew : true,
    };

    // Handle variants if provided
    if (variants && variants.length > 0) {
      updateData.variants = variants.map((variant) => ({
        id: variant.id, // Keep existing ID if updating
        size: variant.size,
        color: variant.color.trim(),
        stock: parseInt(variant.stock) || 0,
        sku:
          variant.sku ||
          `${slug}-${variant.size}-${variant.color
            .toLowerCase()
            .replace(/\s+/g, "-")}`,
      }));
    }

    const result = await updateProduct(id, updateData);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating product",
    });
  }
};

const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteProduct(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting product",
    });
  }
};

const getSingleProductForAdminController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getSingleProductForAdmin(id);

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
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching product",
    });
  }
};

const uploadImageController = async (req, res) => {
  try {
    // Handle both single and multiple file uploads
    const files = req.files || (req.file ? [req.file] : []);

    console.log("=== IMAGE UPLOAD DEBUG ===");
    console.log("req.files:", req.files ? req.files.length : "undefined");
    console.log("req.file:", req.file ? "present" : "undefined");
    console.log("files array length:", files.length);
    console.log(
      "files details:",
      files.map((f) => ({
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
      }))
    );

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided",
      });
    }

    const uploadPromises = files.map(async (file, index) => {
      console.log(`Uploading file ${index + 1}:`, file.originalname);

      // Generate unique filename with timestamp and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.originalname.split(".").pop();
      const uniqueFilename = `product_${timestamp}_${randomString}`;

      console.log(`Generated unique filename:`, uniqueFilename);

      // Create upload options with folder and unique public_id
      const uploadOptions = {
        folder: "bias_clothing/tshirts",
        public_id: uniqueFilename, // Just the filename, folder is specified separately
        overwrite: false,
        resource_type: "auto",
        quality: "auto:good",
      };

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(file.buffer);
      });

      console.log(
        `File ${index + 1} uploaded successfully:`,
        result.secure_url
      );
      console.log(`Public ID:`, result.public_id);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    });

    const uploadResults = await Promise.all(uploadPromises);
    console.log("All uploads completed:", uploadResults.length, "files");
    console.log(
      "Final URLs:",
      uploadResults.map((r) => r.url)
    );

    res.status(200).json({
      success: true,
      message: `${uploadResults.length} image(s) uploaded successfully`,
      data: uploadResults.length === 1 ? uploadResults[0] : uploadResults,
    });
  } catch (error) {
    console.error("Error uploading image(s):", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error uploading image(s)",
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
  // New exports
  createProductController,
  updateProductController,
  deleteProductController,
  getSingleProductForAdminController,
  uploadImageController,
  upload, // Export multer middleware
};
