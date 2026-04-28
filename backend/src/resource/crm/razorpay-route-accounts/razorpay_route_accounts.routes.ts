import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { RazorpayRouteAccountsController } from "./razorpay_route_accounts.controller";

const router = Router();
const controller = new RazorpayRouteAccountsController();

// NOTE: Path is intentionally `/rezorpay` to match existing CRM request plan.
router.get(
  "/api/rezorpay/route/accounts",
  allowAccessMiddleware("CRM"),
  controller.getAllAccounts
);

router.get(
  "/api/rezorpay/route/accounts/:id",
  allowAccessMiddleware("CRM"),
  controller.getAccountById
);

router.post(
  "/api/rezorpay/route/accounts",
  allowAccessMiddleware("CRM"),
  controller.createLinkedAccount
);

// DB-only create (no Razorpay API call)
router.post(
  "/api/rezorpay/route/accounts/db",
  allowAccessMiddleware("CRM"),
  controller.createLinkedAccountDbOnly
);

router.patch(
  "/api/rezorpay/route/accounts/:id",
  allowAccessMiddleware("CRM"),
  controller.updateLinkedAccount
);

// DB-only update (no Razorpay API call)
router.patch(
  "/api/rezorpay/route/accounts/:id/db",
  allowAccessMiddleware("CRM"),
  controller.updateLinkedAccountDbOnly
);

export default router;

