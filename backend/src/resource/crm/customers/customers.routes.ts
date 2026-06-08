import { Router } from "express";
import { CustomerProfileController } from "./customer.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const crmCustomersRoutes = Router();
const controller = new CustomerProfileController();

crmCustomersRoutes.get(
  "/api/crm/customers",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.filterCustomer(req, res)
);

crmCustomersRoutes.get(
  "/api/crm/customer/:customerId",
  allowAccessMiddleware("CRM", "USER"),
  (req, res) => controller.getFullProfileCustomer(req, res)
);

crmCustomersRoutes.get(
  "/api/crm/customer/participant/:participantCode",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.getCustomerByParticipantCode(req, res)
);
crmCustomersRoutes.post(
  "/api/crm/customer",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.createCustomer(req, res)
);
crmCustomersRoutes.patch(
  "/api/crm/customer/:customerId",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.updateCustomer(req, res)
);
crmCustomersRoutes.delete(
  "/api/crm/customer/:customerId",
  allowAccessMiddleware("SUPER_ADMIN"),
  (req, res) => controller.softDeleteCustomer(req, res)
);
crmCustomersRoutes.delete(
  "/api/crm/customer/force/:customerId",
  allowAccessMiddleware("SUPER_ADMIN"),
  (req, res) => controller.deleteCustomer(req, res)
);

/** Same bank/demat default flow as customer self-serve profile APIs; SUPER_ADMIN only. */
crmCustomersRoutes.post(
  "/api/crm/customer/:customerId/bank-account/primary/:bankAccountId",
  allowAccessMiddleware("SUPER_ADMIN"),
  (req, res) => controller.crmSetPrimaryBankAccount(req, res),
);

crmCustomersRoutes.post(
  "/api/crm/customer/:customerId/demat-account/primary/:dematAccountId",
  allowAccessMiddleware("SUPER_ADMIN"),
  (req, res) => controller.crmSetPrimaryDematAccount(req, res),
);

crmCustomersRoutes.get(
  "/api/crm/customer/:customerId/corporate-kyc/pdf",
  allowAccessMiddleware("ADMIN", "USER"),
  (req, res) => controller.downloadCorporateKycPdf(req, res)
);

crmCustomersRoutes.get(
  "/api/crm/customer/:customerId/corporate-kyc",
  allowAccessMiddleware("ADMIN", "USER"),
  (req, res) => controller.getCorporateKyc(req, res)
);

crmCustomersRoutes.put(
  "/api/crm/customer/:customerId/corporate-kyc",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.saveCorporateKyc(req, res)
);

crmCustomersRoutes.get(
  "/api/crm/customer/:customerId/corporate-kyc/kra/status",
  allowAccessMiddleware("ADMIN", "USER"),
  (req, res) => controller.corporateKraStatus(req, res),
);

crmCustomersRoutes.get(
  "/api/crm/customer/:customerId/corporate-kyc/kra/preview",
  allowAccessMiddleware("ADMIN", "USER"),
  (req, res) => controller.corporateKraPreview(req, res),
);

crmCustomersRoutes.post(
  "/api/crm/customer/:customerId/corporate-kyc/kra/download",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.corporateKraDownload(req, res),
);

crmCustomersRoutes.post(
  "/api/crm/customer/:customerId/corporate-kyc/kra/autofill",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.corporateKraAutofill(req, res),
);

crmCustomersRoutes.post(
  "/api/crm/customer/:customerId/corporate-kyc/kra/trigger",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.triggerCorporateKra(req, res),
);

crmCustomersRoutes.post(
  "/api/crm/customer/:customerId/corporate-kyc/kra/finish",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.finishCorporateKra(req, res),
);

crmCustomersRoutes.get(
  "/api/crm/customer/:customerId/corporate-kyc/attachments",
  allowAccessMiddleware("ADMIN", "USER"),
  (req, res) => controller.listCorporateKycAttachments(req, res),
);

crmCustomersRoutes.post(
  "/api/crm/customer/:customerId/corporate-kyc/attachments",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.createCorporateKycAttachment(req, res),
);

crmCustomersRoutes.delete(
  "/api/crm/customer/:customerId/corporate-kyc/attachments/:attachmentId",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.deleteCorporateKycAttachment(req, res),
);

export default crmCustomersRoutes;
