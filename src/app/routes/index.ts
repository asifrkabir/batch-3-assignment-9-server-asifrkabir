import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ShopRoutes } from "../modules/shop/shop.route";
import { UserRoutes } from "../modules/user/user.route";
import { ProductCategoryRoutes } from "./../modules/productCategory/productCategory.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/shops",
    route: ShopRoutes,
  },
  {
    path: "/product-categories",
    route: ProductCategoryRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
