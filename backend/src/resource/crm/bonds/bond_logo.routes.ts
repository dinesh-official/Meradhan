import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { BondLogoController } from "./bond_logo.controller";

const router = Router();
const controller = new BondLogoController();

router.get(
  "/api/crm/bonds/:isin/logo",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.get(req, res),
);

router.put(
  "/api/crm/bonds/:isin/logo",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.update(req, res),
);

router.delete(
  "/api/crm/bonds/:isin/logo",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.remove(req, res),
);

export default router;
