import { withAuthMiddleware } from "@lib/middlewares/auth.middleware";
import { Router } from "express";
import { LeadController } from "./leads.controller";

const leadsRoutes = Router();

const controller = new LeadController()

leadsRoutes.get("/api/crm/leads", withAuthMiddleware, (req, res) => controller.filterLead(req, res))
leadsRoutes.post("/api/crm/lead", withAuthMiddleware, (req, res) => controller.createLead(req, res))
leadsRoutes.get("/api/crm/lead/:leadId", withAuthMiddleware, (req, res) => controller.getLead(req, res))
leadsRoutes.put("/api/crm/lead/:leadId", withAuthMiddleware, (req, res) => controller.updateLead(req, res))
leadsRoutes.delete("/api/crm/lead/:leadId", withAuthMiddleware, (req, res) => controller.deleteLead(req, res))



export default leadsRoutes; 