import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { RazorpayRouteSettlementAccountsController } from "./razorpay_route_settlement_accounts.controller";

const router = Router();
const controller = new RazorpayRouteSettlementAccountsController();

router.get(
  "/api/rezorpay/route/accounts/:id/settlement-accounts",
  allowAccessMiddleware("CRM"),
  controller.listByAccount
);

router.post(
  "/api/rezorpay/route/accounts/:id/settlement-accounts",
  allowAccessMiddleware("CRM"),
  controller.createForAccount
);

router.patch(
  "/api/rezorpay/route/accounts/:id/settlement-accounts/:settlementId",
  allowAccessMiddleware("CRM"),
  controller.updateForAccount
);

router.delete(
  "/api/rezorpay/route/accounts/:id/settlement-accounts/:settlementId",
  allowAccessMiddleware("CRM"),
  controller.deleteForAccount
);

export default router;

