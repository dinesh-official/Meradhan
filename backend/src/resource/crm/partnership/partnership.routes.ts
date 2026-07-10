import { Router } from "express";
import { PartnershipController } from "./partnership.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const partnershipRoutes = Router();
const controller = new PartnershipController();

// Allow ADMIN full access; USER can access but will be filtered to own/assigned
partnershipRoutes.get(
  "/api/crm/partnerships",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.filterPartnership(req, res)
);
partnershipRoutes.post(
  "/api/crm/partnership",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.createPartnership(req, res)
);
partnershipRoutes.get(
  "/api/crm/partnership/:partnershipId",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.getPartnership(req, res)
);
partnershipRoutes.put(
  "/api/crm/partnership/:partnershipId",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.updatePartnership(req, res)
);
partnershipRoutes.delete(
  "/api/crm/partnership/:partnershipId",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.deletePartnership(req, res)
);

export default partnershipRoutes;

