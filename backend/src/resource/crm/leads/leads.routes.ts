import { Router } from "express";
import { LeadController } from "./leads.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const leadsRoutes = Router();
const controller = new LeadController();

// Allow ADMIN full access; USER can access but will be filtered to own/assigned
leadsRoutes.get("/api/crm/leads", allowAccessMiddleware("CRM"), (req, res) =>
  controller.filterLead(req, res)
);
leadsRoutes.post("/api/crm/lead", allowAccessMiddleware("CRM"), (req, res) =>
  controller.createLead(req, res)
);
leadsRoutes.get(
  "/api/crm/leads/summary",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.leadSourceSummary(req, res)
);
leadsRoutes.get(
  "/api/crm/lead/:leadId",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.getLead(req, res)
);
leadsRoutes.put(
  "/api/crm/lead/:leadId",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.updateLead(req, res)
);
leadsRoutes.delete(
  "/api/crm/lead/:leadId",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.deleteLead(req, res)
);

export default leadsRoutes;
