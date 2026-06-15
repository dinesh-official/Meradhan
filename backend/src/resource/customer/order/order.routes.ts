import { Router } from "express";
import { OrderController } from "./order.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const orderRoutes = Router();
const orderController = new OrderController();

orderRoutes.get(
  "/api/customer/order/payment-gateway-mode",
  allowAccessMiddleware("USER"),
  orderController.getPaymentGatewayMode
);

orderRoutes.post(
  "/api/customer/order/preview",
  allowAccessMiddleware("USER", "CRM"),
  orderController.previewOrder
);

orderRoutes.post(
  "/api/customer/order/pay",
  allowAccessMiddleware("USER"),
  orderController.createOrder
);

orderRoutes.post(
  "/api/customer/order/cancel",
  allowAccessMiddleware("USER"),
  orderController.cancelOrder
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

orderRoutes.get(
  "/api/customer/order/:orderNumber/receipt-pdf",
  allowAccessMiddleware("USER"),
  orderController.downloadOrderReceiptPdf
);

orderRoutes.get(
  "/api/customer/order/:orderNumber/deal-pdf",
  allowAccessMiddleware("USER"),
  orderController.downloadDealSheetPdf
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
