import { Router } from "express";
import {
  getAllProductsController,
  getFeaturedProductsController,
  getNewProductsController,
} from "../controller/productController.js";

const productRouter = Router();

productRouter.get("/all", getAllProductsController);
productRouter.get("/featured", getFeaturedProductsController);
productRouter.get("/new", getNewProductsController);

export default productRouter;
