import { Router } from "express";
import { CrmOrdersController } from "./orders.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const router = Router();
const crmOrdersController = new CrmOrdersController();

router.get(
  "/api/crm/orders/all",
  allowAccessMiddleware("ADMIN"),
  crmOrdersController.getAllOrders
);

router.get(
  "/api/crm/orders/:id",
  allowAccessMiddleware("ADMIN"),
  crmOrdersController.getOrderById
);

router.patch(
  "/api/crm/orders/:id/status",
  allowAccessMiddleware("ADMIN"),
  crmOrdersController.updateOrderStatus
);

export default router;
