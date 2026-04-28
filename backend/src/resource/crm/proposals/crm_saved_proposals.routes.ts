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

export default router;

