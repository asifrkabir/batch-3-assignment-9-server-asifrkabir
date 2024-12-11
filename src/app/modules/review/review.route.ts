import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE_ENUM } from "../user/user.constant";
import { ReviewController } from "./review.controller";
import { ReviewValidations } from "./review.validation";

const router = Router();

router.get(
  "/",
  ReviewController.getAllReviews
);

router.post(
  "/",
  auth(USER_ROLE_ENUM.admin, USER_ROLE_ENUM.user, USER_ROLE_ENUM.vendor),
  validateRequest(ReviewValidations.createReviewValidationSchema),
  ReviewController.createReview
);

export const ReviewRoutes = router;
