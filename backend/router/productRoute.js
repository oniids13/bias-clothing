import { Router } from "express";
import {
  getActiveProductsController,
  getInactiveProductsController,
  getFeaturedProductsController,
  getNewProductsController,
} from "../controller/productController.js";

const productRouter = Router();

productRouter.get("/active", getActiveProductsController);
productRouter.get("/inactive", getInactiveProductsController);
productRouter.get("/featured", getFeaturedProductsController);
productRouter.get("/new", getNewProductsController);

export default productRouter;
