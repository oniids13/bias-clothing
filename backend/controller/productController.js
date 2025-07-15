import {
  getAllProducts,
  getFeaturedProducts,
  getNewProducts,
  getSingleProduct,
} from "../model/productQueries.js";

const getActiveProductsController = async (req, res) => {
  try {
    const products = await getAllProducts();
    const activeProducts = products.filter((product) => product.isActive);
    res.status(200).json(activeProducts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

const getInactiveProductsController = async (req, res) => {
  try {
    const products = await getAllProducts();
    const inactiveProducts = products.filter((product) => !product.isActive);
    res.status(200).json(inactiveProducts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
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
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching single product" });
  }
};

export {
  getActiveProductsController,
  getInactiveProductsController,
  getFeaturedProductsController,
  getNewProductsController,
  getSingleProductController,
};
