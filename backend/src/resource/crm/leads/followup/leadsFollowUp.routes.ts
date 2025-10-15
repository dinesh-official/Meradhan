import { Router } from "express";
import { LeadsFollowUpController } from "./leadsFollowUp.controller";
import { withAuthMiddleware } from "@lib/middlewares/auth.middleware";


const followUpRouter = Router();
const controller = new LeadsFollowUpController();

// Create new follow-up note for a lead
followUpRouter.post("/api/crm/lead/followup/:leadId", withAuthMiddleware, controller.createFollowUpNote.bind(controller));

// Get all follow-up notes by lead ID
followUpRouter.get("/api/crm/lead/followup/:leadId", withAuthMiddleware, controller.getFollowUpNotesByLeadId.bind(controller));

// Update a follow-up note
followUpRouter.put("/api/crm/lead/followup/:id", withAuthMiddleware, controller.updateFollowUpNote.bind(controller));

// Delete a follow-up note
followUpRouter.delete("/api/crm/lead/followup/:id", withAuthMiddleware, controller.deleteFollowUpNote.bind(controller));

export default followUpRouter;
