import { Router } from "express";
import { PartnershipFollowUpController } from "./partnership_follow_up.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const partnershipFollowUpRouter = Router();
const controller = new PartnershipFollowUpController();

// Create new follow-up note for a partnership
partnershipFollowUpRouter.post(
  "/api/crm/partnership/followup/:partnershipId",
  allowAccessMiddleware("CRM"),
  controller.createFollowUpNote.bind(controller)
);

// Get all follow-up notes by partnership ID
partnershipFollowUpRouter.get(
  "/api/crm/partnership/followup/:partnershipId",
  allowAccessMiddleware("CRM"),
  controller.getFollowUpNotesByPartnershipId.bind(controller)
);

// Update a follow-up note
partnershipFollowUpRouter.put(
  "/api/crm/partnership/followup/:id",
  allowAccessMiddleware("CRM"),
  controller.updateFollowUpNote.bind(controller)
);

// Delete a follow-up note
partnershipFollowUpRouter.delete(
  "/api/crm/partnership/followup/:id",
  allowAccessMiddleware("CRM"),
  controller.deleteFollowUpNote.bind(controller)
);

export default partnershipFollowUpRouter;

