import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { RazorpayRouteStakeholdersController } from "./razorpay_route_stakeholders.controller";

const router = Router();
const controller = new RazorpayRouteStakeholdersController();

router.get(
  "/api/rezorpay/route/accounts/:id/stakeholders",
  allowAccessMiddleware("CRM"),
  controller.listByAccount
);

router.post(
  "/api/rezorpay/route/accounts/:id/stakeholders",
  allowAccessMiddleware("CRM"),
  controller.createForAccount
);

router.patch(
  "/api/rezorpay/route/accounts/:id/stakeholders/:stakeholderId",
  allowAccessMiddleware("CRM"),
  controller.updateForAccount
);

export default router;

