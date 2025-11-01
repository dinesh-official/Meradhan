import { withCrmAuthMiddleware } from "@middlewares/crm_middleware";
import { Router } from "express";
import { LeadsFollowUpController } from "./leads_follow_up.controller";



const followUpRouter = Router();
const controller = new LeadsFollowUpController();

// Create new follow-up note for a lead
followUpRouter.post("/api/crm/lead/followup/:leadId", withCrmAuthMiddleware, controller.createFollowUpNote.bind(controller));

// Get all follow-up notes by lead ID
followUpRouter.get("/api/crm/lead/followup/:leadId", withCrmAuthMiddleware, controller.getFollowUpNotesByLeadId.bind(controller));

// Update a follow-up note
followUpRouter.put("/api/crm/lead/followup/:id", withCrmAuthMiddleware, controller.updateFollowUpNote.bind(controller));

// Delete a follow-up note
followUpRouter.delete("/api/crm/lead/followup/:id", withCrmAuthMiddleware, controller.deleteFollowUpNote.bind(controller));

export default followUpRouter;
