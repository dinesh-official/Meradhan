import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { BondReferenceDataController } from "./bond_reference_data.controller";

const router = Router();
const controller = new BondReferenceDataController();

router.post(
  "/api/crm/bonds/reference-data/upsert-isin",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.upsertByIsin(req, res)
);

router.get(
  "/api/crm/bonds/reference-data",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.list(req, res)
);

router.get(
  "/api/crm/bonds/reference-data/:isin/schedules",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.schedules(req, res)
);

export default router;
