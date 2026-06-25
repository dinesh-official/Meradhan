import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { BondAutoUpdateAutofillController } from "./bond_auto_update_autofill.controller";

const router = Router();
const controller = new BondAutoUpdateAutofillController();

router.post(
  "/api/crm/bonds/:isin/auto-update-autofill",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.autofill(req, res),
);

export default router;
