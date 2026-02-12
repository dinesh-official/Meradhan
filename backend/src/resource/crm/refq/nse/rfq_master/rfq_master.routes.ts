import { Router } from "express";
import { RfqMasterController } from "./rfq_master.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
const rfqMasterRouter = Router();

const controller = new RfqMasterController();
rfqMasterRouter.get(
  "/api/crm/rfq/nse/find",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.getAllRfq(req, res)
);
rfqMasterRouter.get(
  "/api/crm/rfq/nse/find/:number",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.getRfqById(req, res)
);
rfqMasterRouter.post(
  "/api/crm/rfq/nse/add-isin",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.addIsinToRfq(req, res)
);
rfqMasterRouter.post(
  "/api/crm/rfq/nse/negotiate/accept",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.negotiateRfqAccept(req, res)
);
rfqMasterRouter.post(
  "/api/crm/rfq/nse/negotiations",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.getAllNegotiations(req, res)
);
rfqMasterRouter.post(
  "/api/crm/rfq/nse/deal/propose",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.proposeDeal(req, res)
);

rfqMasterRouter.post(
  "/api/crm/rfq/nse/negotiate/terminate",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.negotiateRfqTerminate(req, res)
);

rfqMasterRouter.post(
  "/api/crm/rfq/nse/deal/accept-reject",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.acceptRejectDeal(req, res)
);

rfqMasterRouter.post(
  "/api/crm/rfq/nse/dealamend/all",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.getAllDealamend(req, res)
);

rfqMasterRouter.post(
  "/api/crm/rfq/nse/settle/orders",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.getAllSettledOrders(req, res)
);

export default rfqMasterRouter;
