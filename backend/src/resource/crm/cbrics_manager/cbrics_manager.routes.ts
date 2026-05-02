import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { CbricsManagerController } from "./cbrics_manager.controller";

const router = Router();
const controller = new CbricsManagerController();

router.get(
  "/api/crm/tools/cbrics-manager/customers/grouped-by-workflow",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.getCustomersGroupedByParticipantWorkflow(req, res),
);

router.get(
  "/api/crm/tools/cbrics-manager/customers",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.getCustomersWithCbricsParticipant(req, res),
);

router.get(
  "/api/crm/tools/cbrics-manager/db/participants",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.getAllDbNseCbricsParticipants(req, res),
);

router.get(
  "/api/crm/tools/cbrics-manager/participants/:id/customer-profile-match-keys",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.getCustomerProfileMatchKeys(req, res),
);

router.get(
  "/api/crm/tools/cbrics-manager/participants/:id",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.getParticipantById(req, res),
);

router.post(
  "/api/crm/tools/cbrics-manager/participants/:id/create-missing-profile-financials",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.postParticipantCreateMissingProfileFinancials(req, res),
);

router.post(
  "/api/crm/tools/cbrics-manager/bank-accounts/list",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.postBankAccountsList(req, res),
);

router.post(
  "/api/crm/tools/cbrics-manager/dp-accounts/list",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.postDpAccountsList(req, res),
);

router.post(
  "/api/crm/tools/cbrics-manager/bank-accounts/mark-default",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.postBankMarkDefault(req, res),
);

router.post(
  "/api/crm/tools/cbrics-manager/dp-accounts/mark-default",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.postDpMarkDefault(req, res),
);

router.post(
  "/api/crm/tools/cbrics-manager/participants/:id/update",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.postParticipantUpdate(req, res),
);

export default router;
