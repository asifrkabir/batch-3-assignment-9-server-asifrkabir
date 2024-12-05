import { Router } from "express";
import { multerUpload } from "../../config/multer.config";
import auth from "../../middlewares/auth";
import { parseBody } from "../../middlewares/bodyParser";
import validateImageFileRequest from "../../middlewares/validateImageFileRequest";
import validateRequest from "../../middlewares/validateRequest";
import { ImageFilesArrayZodSchema } from "../../zod/image.validation";
import { USER_ROLE_ENUM } from "../user/user.constant";
import { ProductController } from "./product.controller";
import { ProductValidations } from "./product.validation";

const router = Router();

router.get(
  "/:id",
  auth(USER_ROLE_ENUM.admin, USER_ROLE_ENUM.user, USER_ROLE_ENUM.vendor),
  ProductController.getProductById
);

router.get(
  "/",
  auth(USER_ROLE_ENUM.admin, USER_ROLE_ENUM.user, USER_ROLE_ENUM.vendor),
  ProductController.getAllProducts
);

router.post(
  "/",
  auth(USER_ROLE_ENUM.admin, USER_ROLE_ENUM.vendor),
  multerUpload.fields([{ name: "productImages" }]),
  validateImageFileRequest(ImageFilesArrayZodSchema),
  parseBody,
  validateRequest(ProductValidations.createProductValidationSchema),
  ProductController.createProduct
);

router.put(
  "/:id",
  auth(USER_ROLE_ENUM.admin, USER_ROLE_ENUM.vendor),
  multerUpload.fields([{ name: "productImages" }]),
  validateImageFileRequest(ImageFilesArrayZodSchema),
  parseBody,
  validateRequest(ProductValidations.updateProductValidationSchema),
  ProductController.updateProduct
);

export const ProductRoutes = router;
