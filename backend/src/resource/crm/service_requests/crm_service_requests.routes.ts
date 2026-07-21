import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { requireServiceRequestAdmin } from "@middlewares/service_requests_admin_middleware";
import { CrmServiceRequestController } from "./crm_service_requests.controller";

const crmServiceRequestsRoutes = Router();
const controller = new CrmServiceRequestController();
const adminGate = [allowAccessMiddleware("CRM"), requireServiceRequestAdmin];

crmServiceRequestsRoutes.get(
  "/api/crm/service-requests",
  ...adminGate,
  (req, res) => controller.listRequests(req, res),
);

crmServiceRequestsRoutes.patch(
  "/api/crm/service-requests/:id/close-account",
  ...adminGate,
  (req, res) => controller.closeAccount(req, res),
);

crmServiceRequestsRoutes.patch(
  "/api/crm/service-requests/:id/reject",
  ...adminGate,
  (req, res) => controller.rejectRequest(req, res),
);

export default crmServiceRequestsRoutes;
