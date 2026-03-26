import { Router } from "express";
import { OrderController } from "./order.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const orderRoutes = Router();
const orderController = new OrderController();

orderRoutes.post(
  "/api/customer/order/preview",
  allowAccessMiddleware("USER"),
  orderController.previewOrder
);

orderRoutes.post(
  "/api/customer/order/pay",
  allowAccessMiddleware("USER"),
  orderController.createOrder
);

orderRoutes.post(
  "/api/customer/order/cancel/:orderId",
  allowAccessMiddleware("USER"),
  orderController.cancelOrder
);

orderRoutes.post(
  "/api/customer/order/status/:orderId",
  allowAccessMiddleware("USER"),
  orderController.setOrderStatus
);

orderRoutes.get(
  "/api/customer/order/history",
  allowAccessMiddleware("USER"),
  orderController.getOrderHistory
);

orderRoutes.all(
  "/api/customer/order/pdf",
  allowAccessMiddleware("USER"),
  orderController.getOrderPdf
);

orderRoutes.post(
  "/api/customer/order/log",
  allowAccessMiddleware("USER"),
  orderController.addOrderLog
);

export default orderRoutes;
