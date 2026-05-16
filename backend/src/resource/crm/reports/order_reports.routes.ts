import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { OrderReportsController } from "./order_reports.controller";

const router = Router();
const ctrl = new OrderReportsController();

router.get(
  "/api/crm/reports/orders/summary",
  allowAccessMiddleware("CRM"),
  ctrl.getSummary,
);

router.get(
  "/api/crm/reports/orders/register",
  allowAccessMiddleware("CRM"),
  ctrl.getRegister,
);

router.get(
  "/api/crm/reports/orders/register/export",
  allowAccessMiddleware("CRM"),
  ctrl.getRegisterExport,
);

router.get(
  "/api/crm/reports/orders/by-isin",
  allowAccessMiddleware("CRM"),
  ctrl.getByIsin,
);

router.get(
  "/api/crm/reports/orders/revenue",
  allowAccessMiddleware("CRM"),
  ctrl.getRevenue,
);

router.get(
  "/api/crm/reports/orders/funnel",
  allowAccessMiddleware("CRM"),
  ctrl.getFunnel,
);

router.get(
  "/api/crm/reports/orders/by-customer",
  allowAccessMiddleware("CRM"),
  ctrl.getByCustomer,
);

router.get(
  "/api/crm/reports/orders/holdings",
  allowAccessMiddleware("CRM"),
  ctrl.getHoldings,
);

router.get(
  "/api/crm/reports/orders/log-failures",
  allowAccessMiddleware("CRM"),
  ctrl.getLogFailures,
);

router.get(
  "/api/crm/reports/orders/settlement-automation",
  allowAccessMiddleware("CRM"),
  ctrl.getSettlementAutomation,
);

router.get(
  "/api/crm/reports/orders/lifecycle",
  allowAccessMiddleware("CRM"),
  ctrl.getLifecycle,
);

export default router;
