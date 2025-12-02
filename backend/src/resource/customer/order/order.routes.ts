import { Router } from "express";
import { OrderController } from "./order.controller";
import { customerAuthMiddleware } from "@middlewares/customer_middleware";

const orderRoutes = Router();
const orderController = new OrderController();

orderRoutes.post(
  "/api/customer/order/preview",
  customerAuthMiddleware,
  orderController.previewOrder
);

orderRoutes.post(
  "/api/customer/order/pay",
  customerAuthMiddleware,
  orderController.createOrder
);

orderRoutes.get(
  "/api/customer/order/history",
  customerAuthMiddleware,
  orderController.getOrderHistory
);

export default orderRoutes;
