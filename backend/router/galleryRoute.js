import { Router } from "express";
import { getGalleryController } from "../controller/galleryController.js";

const galleryRouter = Router();

galleryRouter.get("/", getGalleryController);

export default galleryRouter;
