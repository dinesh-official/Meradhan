import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { requirePermission } from "@middlewares/require_permission_middleware";
import { BondMarginController } from "./bond_margin.controller";

const router = Router();
const controller = new BondMarginController();

router.get(
  "/api/crm/bonds/margins",
  allowAccessMiddleware("CRM"),
  requirePermission("bonds.margins.view"),
  (req, res) => controller.list(req, res),
);

router.post(
  "/api/crm/bonds/margins",
  allowAccessMiddleware("CRM"),
  requirePermission("bonds.margins.create"),
  (req, res) => controller.create(req, res),
);

router.patch(
  "/api/crm/bonds/margins/:id",
  allowAccessMiddleware("CRM"),
  requirePermission("bonds.margins.edit"),
  (req, res) => controller.update(req, res),
);

router.delete(
  "/api/crm/bonds/margins/:id",
  allowAccessMiddleware("CRM"),
  requirePermission("bonds.margins.delete"),
  (req, res) => controller.remove(req, res),
);

export default router;
