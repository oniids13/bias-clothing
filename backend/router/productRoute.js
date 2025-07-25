import { Router } from "express";
import {
  getAllProductsController,
  getActiveProductsController,
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
} from "../controller/productController.js";

const productRouter = Router();

// Basic product routes
productRouter.get("/all", getAllProductsController);
productRouter.get("/active", getActiveProductsController);
productRouter.get("/featured", getFeaturedProductsController);
productRouter.get("/new", getNewProductsController);

// Stock and variant routes
productRouter.get("/:productId/colors", getProductColorsController);
productRouter.get("/:productId/sizes", getProductSizesController);
productRouter.get(
  "/:productId/colors/:size",
  getAvailableColorsForSizeController
);
productRouter.get(
  "/:productId/sizes/:color",
  getAvailableSizesForColorController
);
productRouter.get("/:productId/stock/:size/:color", getVariantStockController);
productRouter.get(
  "/:productId/variant-options",
  getProductVariantOptionsController
);
productRouter.get(
  "/:productId/check-availability",
  checkVariantAvailabilityController
);

// Single product route (must be last due to slug parameter)
productRouter.get("/:slug", getSingleProductController);

export default productRouter;
