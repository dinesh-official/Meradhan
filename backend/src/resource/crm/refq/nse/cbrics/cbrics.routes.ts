import { Router } from "express";
import { CbricsParticipantController } from "./cbrics.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
const participantsRouter = Router();

const controller = new CbricsParticipantController();
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

export default participantsRouter;
