import { withCrmAuthMiddleware } from "@middlewares/crm_middleware";
import { Router } from "express";
import { CrmOrdersController } from "./orders.controller";

const router = Router();
const crmOrdersController = new CrmOrdersController();

router.get("/api/crm/orders/all", withCrmAuthMiddleware, crmOrdersController.getAllOrders);

export default router;
