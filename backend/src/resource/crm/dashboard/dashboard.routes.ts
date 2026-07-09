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

export default dashboardRoutes;

