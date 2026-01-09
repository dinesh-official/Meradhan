import { Router } from "express";
import { LeadController } from "./leads.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const leadsRoutes = Router();
const controller = new LeadController();

leadsRoutes.get("/api/crm/leads", allowAccessMiddleware("ADMIN"), (req, res) =>
  controller.filterLead(req, res)
);
leadsRoutes.post("/api/crm/lead", allowAccessMiddleware("ADMIN"), (req, res) =>
  controller.createLead(req, res)
);
leadsRoutes.get(
  "/api/crm/leads/summary",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.leadSourceSummary(req, res)
);
leadsRoutes.get(
  "/api/crm/lead/:leadId",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.getLead(req, res)
);
leadsRoutes.put(
  "/api/crm/lead/:leadId",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.updateLead(req, res)
);
leadsRoutes.delete(
  "/api/crm/lead/:leadId",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.deleteLead(req, res)
);

export default leadsRoutes;
