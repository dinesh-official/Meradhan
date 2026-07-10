import { Router } from "express";
import { CbricsParticipantController } from "./cbrics.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
const participantsRouter = Router();

const controller = new CbricsParticipantController();
participantsRouter.post(
  "/api/crm/rfq/nse/cbrics/participants/resync-kra-status",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.handleResyncKraFromCbricsParticipants(req, res)
);
participantsRouter.get(
  "/api/crm/rfq/nse/cbrics/workflow-statuses",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.handleGetCbricsWorkflowStatuses(req, res)
);
participantsRouter.get(
  "/api/crm/rfq/nse/cbrics/participants/workflow/:workflowStatus",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.handleGetParticipantsCbricsByWorkflow(req, res)
);
participantsRouter.get(
  "/api/crm/rfq/nse/db/participants",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.handleGetParticipants(req, res)
);
participantsRouter.get(
  "/api/crm/rfq/nse/cbrics/participants",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.handleGetParticipantsCbrics(req, res)
);
participantsRouter.get(
  "/api/crm/rfq/nse/rfq/participants",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.handleGetParticipantsRfq(req, res)
);

// CRM-private participant enrichment (contact / KYC / banks / demats)
participantsRouter.get(
  "/api/crm/rfq/nse/rfq/participants/info/codes",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.handleListSavedRfqParticipantInfoCodes(req, res)
);
participantsRouter.get(
  "/api/crm/rfq/nse/rfq/participants/info/summary",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.handleListRfqParticipantInfoSummaries(req, res)
);
participantsRouter.get(
  "/api/crm/rfq/nse/rfq/participants/:code/info",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.handleGetRfqParticipantInfo(req, res)
);
participantsRouter.put(
  "/api/crm/rfq/nse/rfq/participants/:code/info",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.handleUpsertRfqParticipantInfo(req, res)
);

export default participantsRouter;
