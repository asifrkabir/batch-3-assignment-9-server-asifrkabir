import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE_ENUM } from "../user/user.constant";
import { OrderController } from "./order.controller";
import { OrderValidations } from "./order.validation";

const router = Router();

router.post(
  "/",
  auth(USER_ROLE_ENUM.admin, USER_ROLE_ENUM.user, USER_ROLE_ENUM.vendor),
  validateRequest(OrderValidations.createOrderValidationSchema),
  OrderController.createOrder
);

export const OrderRoutes = router;
