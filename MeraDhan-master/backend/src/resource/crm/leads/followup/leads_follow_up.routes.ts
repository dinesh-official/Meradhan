import { Router } from "express";
import { LeadsFollowUpController } from "./leads_follow_up.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const followUpRouter = Router();
const controller = new LeadsFollowUpController();

// Create new follow-up note for a lead
followUpRouter.post(
  "/api/crm/lead/followup/:leadId",
  allowAccessMiddleware("CRM"),
  controller.createFollowUpNote.bind(controller)
);

// Get all follow-up notes by lead ID
followUpRouter.get(
  "/api/crm/lead/followup/:leadId",
  allowAccessMiddleware("CRM"),
  controller.getFollowUpNotesByLeadId.bind(controller)
);

// Update a follow-up note
followUpRouter.put(
  "/api/crm/lead/followup/:id",
  allowAccessMiddleware("CRM"),
  controller.updateFollowUpNote.bind(controller)
);

// Delete a follow-up note
followUpRouter.delete(
  "/api/crm/lead/followup/:id",
  allowAccessMiddleware("CRM"),
  controller.deleteFollowUpNote.bind(controller)
);

export default followUpRouter;
