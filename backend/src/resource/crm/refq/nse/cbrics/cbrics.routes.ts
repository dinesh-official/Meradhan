import { Router } from "express";
import { CbricsParticipantController } from "./cbrics.controller";
import { withCrmAuthMiddleware } from "@middlewares/crm_middleware";
const participantsRouter = Router();

const controller = new CbricsParticipantController();
participantsRouter.get(
  "/api/crm/rfq/nse/db/participants",
  withCrmAuthMiddleware,
  (req, res) => controller.handleGetParticipants(req, res)
);
participantsRouter.get(
  "/api/crm/rfq/nse/cbrics/participants",
  withCrmAuthMiddleware,
  (req, res) => controller.handleGetParticipantsCbrics(req, res)
);
participantsRouter.get(
  "/api/crm/rfq/nse/rfq/participants",
  withCrmAuthMiddleware,
  (req, res) => controller.handleGetParticipantsRfq(req, res)
);

export default participantsRouter;
