import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { CrmSavedProposalsController } from "./crm_saved_proposals.controller";

const router = Router();
const controller = new CrmSavedProposalsController();

router.get(
  "/api/crm/proposals",
  allowAccessMiddleware("CRM"),
  controller.listMine
);

router.get(
  "/api/crm/proposals/all",
  allowAccessMiddleware("CRM"),
  controller.listAll
);

router.post(
  "/api/crm/proposals",
  allowAccessMiddleware("CRM"),
  controller.create
);

router.get(
  "/api/crm/proposals/:id",
  allowAccessMiddleware("CRM"),
  controller.getById
);

router.delete(
  "/api/crm/proposals/:id",
  allowAccessMiddleware("CRM"),
  controller.deleteById
);

router.post(
  "/api/crm/proposals/:id/auto-create-rfq",
  allowAccessMiddleware("CRM"),
  controller.autoCreateRfqAndSync
);

router.post(
  "/api/crm/proposals/:id/process",
  allowAccessMiddleware("CRM"),
  controller.queueProcessing
);

router.post(
  "/api/crm/proposals/:id/waiting-for-approval",
  allowAccessMiddleware("CRM"),
  controller.markWaitingForApproval
);

export default router;

