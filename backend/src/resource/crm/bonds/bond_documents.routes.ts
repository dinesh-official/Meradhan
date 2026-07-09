import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { BondDocumentsController } from "./bond_documents.controller";

const router = Router();
const controller = new BondDocumentsController();

router.get(
  "/api/crm/bonds/:isin/documents",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.list(req, res),
);

router.post(
  "/api/crm/bonds/:isin/documents",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.create(req, res),
);

router.patch(
  "/api/crm/bonds/:isin/documents/:id",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.update(req, res),
);

router.delete(
  "/api/crm/bonds/:isin/documents/:id",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.remove(req, res),
);

export default router;
