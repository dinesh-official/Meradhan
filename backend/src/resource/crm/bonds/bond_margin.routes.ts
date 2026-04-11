import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { BondMarginController } from "./bond_margin.controller";

const router = Router();
const controller = new BondMarginController();

router.get(
  "/api/crm/bonds/margins",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.list(req, res),
);

router.post(
  "/api/crm/bonds/margins",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.create(req, res),
);

router.patch(
  "/api/crm/bonds/margins/:id",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.update(req, res),
);

router.delete(
  "/api/crm/bonds/margins/:id",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.remove(req, res),
);

export default router;

