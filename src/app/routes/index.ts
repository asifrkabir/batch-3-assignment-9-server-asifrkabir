import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ShopRoutes } from "../modules/shop/shop.route";
import { UserRoutes } from "../modules/user/user.route";
import { ProductCategoryRoutes } from "./../modules/productCategory/productCategory.route";
import { FollowRoutes } from "../modules/follow/follow.route";
import { ProductRoutes } from "../modules/product/product.route";
import { OrderRoutes } from "../modules/order/order.route";
import { PaymentRoutes } from "../modules/payment/payment.route";

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
  {
    path: "/follows",
    route: FollowRoutes,
  },
  {
    path: "/products",
    route: ProductRoutes,
  },
  {
    path: "/orders",
    route: OrderRoutes,
  },
  {
    path: "/payments",
    route: PaymentRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
