import { Router } from "express";
import { CrmOrdersController } from "./orders.controller";

const router = Router();
const crmOrdersController = new CrmOrdersController();

router.get("/all", crmOrdersController.getAllOrders);

export default router;
