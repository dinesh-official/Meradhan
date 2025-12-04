import { Router } from "express";
import { RfqMasterController } from "./rfq_master.controller";
import { withCrmAuthMiddleware } from "@middlewares/crm_middleware";
const rfqMasterRouter = Router();

const controller = new RfqMasterController();
rfqMasterRouter.get(
  "/api/crm/rfq/nse/find",
  withCrmAuthMiddleware,
  (req, res) => controller.getAllRfq(req, res)
);
rfqMasterRouter.get(
  "/api/crm/rfq/nse/find/:number",
  withCrmAuthMiddleware,
  (req, res) => controller.getRfqById(req, res)
);
rfqMasterRouter.post(
  "/api/crm/rfq/nse/add-isin",
  withCrmAuthMiddleware,
  (req, res) => controller.addIsinToRfq(req, res)
);
rfqMasterRouter.post(
  "/api/crm/rfq/nse/negotiate/accept",
  withCrmAuthMiddleware,
  (req, res) => controller.negotiateRfqAccept(req, res)
);
rfqMasterRouter.post(
  "/api/crm/rfq/nse/negotiations",
  withCrmAuthMiddleware,
  (req, res) => controller.getAllNegotiations(req, res)
);
rfqMasterRouter.post(
  "/api/crm/rfq/nse/deal/propose",
  withCrmAuthMiddleware,
  (req, res) => controller.proposeDeal(req, res)
);

rfqMasterRouter.post(
  "/api/crm/rfq/nse/negotiate/terminate",
  withCrmAuthMiddleware,
  (req, res) => controller.negotiateRfqTerminate(req, res)
);
rfqMasterRouter.post(
  "/api/crm/rfq/nse/deal/accept-reject",
  withCrmAuthMiddleware,
  (req, res) => controller.acceptRejectDeal(req, res)
);

rfqMasterRouter.post("/api/crm/rfq/nse/dealamend/all", (req, res) =>
  controller.getAllDealamend(req, res)
);

rfqMasterRouter.post("/api/crm/rfq/nse/settle/orders", (req, res) =>
  controller.getAllSettledOrders(req, res)
);

export default rfqMasterRouter;
