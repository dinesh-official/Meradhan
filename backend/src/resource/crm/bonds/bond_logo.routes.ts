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

/** TEMPORARY — logo.dev import; remove with `_temp/logo_dev_fetch.ts`. */
router.post(
  "/api/crm/bonds/:isin/logo/import-logo-dev",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.importFromLogoDev(req, res),
);

export default router;
