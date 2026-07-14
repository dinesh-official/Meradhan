import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const dashboardRoutes = Router();
const controller = new DashboardController();

dashboardRoutes.get(
  "/api/crm/dashboard/summary",
  allowAccessMiddleware("ADMIN", "SUPER_ADMIN", "VIEWER", "SALES", "SUPPORT", "RELATIONSHIP_MANAGER"),
  (req, res) => controller.getSummary(req, res)
);
dashboardRoutes.get(
  "/api/crm/dashboard/sales-performance",
  allowAccessMiddleware("ADMIN", "SUPER_ADMIN", "VIEWER", "SALES", "SUPPORT", "RELATIONSHIP_MANAGER"),
  (req, res) => controller.getSalesPerformance(req, res)
);
dashboardRoutes.get(
  "/api/crm/dashboard/settlement-job-status",
  allowAccessMiddleware("ADMIN", "SUPER_ADMIN", "VIEWER", "SALES", "SUPPORT", "RELATIONSHIP_MANAGER"),
  (req, res) => controller.getSettlementJobStatus(req, res)
);
dashboardRoutes.post(
  "/api/crm/dashboard/run-settlement-reconciliation",
  allowAccessMiddleware("ADMIN", "SUPER_ADMIN"),
  (req, res) => controller.runSettlementReconciliation(req, res)
);
dashboardRoutes.post(
  "/api/crm/dashboard/rerun-last-settlement-job",
  allowAccessMiddleware("ADMIN", "SUPER_ADMIN"),
  (req, res) => controller.rerunLastSettlementJob(req, res)
);

export default dashboardRoutes;

