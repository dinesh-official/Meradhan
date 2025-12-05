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

orderRoutes.post(
  "/api/customer/order/cancel/:orderId",
  customerAuthMiddleware,
  orderController.cancelOrder
);

orderRoutes.post(
  "/api/customer/order/status/:orderId",
  customerAuthMiddleware,
  orderController.setOrderStatus
);

orderRoutes.get(
  "/api/customer/order/history",
  customerAuthMiddleware,
  orderController.getOrderHistory
);

orderRoutes.all(
  "/api/customer/order/pdf",

  orderController.getOrderPdf
);
export default orderRoutes;
