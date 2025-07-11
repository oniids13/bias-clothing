import {
  getAllProducts,
  getFeaturedProducts,
  getNewProducts,
} from "../model/productQueries.js";

const getAllProductsController = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).json(products);
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

export {
  getAllProductsController,
  getFeaturedProductsController,
  getNewProductsController,
};
