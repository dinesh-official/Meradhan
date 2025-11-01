
import { withCrmAuthMiddleware } from "@middlewares/crm_middleware";
import { Router } from "express";
import { LeadController } from "./leads.controller";

const leadsRoutes = Router();
const controller = new LeadController()

leadsRoutes.get("/api/crm/leads", withCrmAuthMiddleware, (req, res) => controller.filterLead(req, res))
leadsRoutes.post("/api/crm/lead", withCrmAuthMiddleware, (req, res) => controller.createLead(req, res))
leadsRoutes.get("/api/crm/lead/:leadId", withCrmAuthMiddleware, (req, res) => controller.getLead(req, res))
leadsRoutes.put("/api/crm/lead/:leadId", withCrmAuthMiddleware, (req, res) => controller.updateLead(req, res))
leadsRoutes.delete("/api/crm/lead/:leadId", withCrmAuthMiddleware, (req, res) => controller.deleteLead(req, res))

export default leadsRoutes; 