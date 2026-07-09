import { Router } from "express";
import { CustomerProfileController } from "./customer.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { withRateLimit } from "@middlewares/ratelimit_midddleare";

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

/**
 * CRM-initiated OTP verification for a customer's mobile / email.
 *
 * OTP is sent to the customer's registered phone / email (the only place
 * that proves possession). The admin asks the customer for the code and
 * types it back into the CRM. Reuses the same MSG91 + SMTP plumbing as
 * the customer self-serve flow, and shares the Redis namespace
 * (`MOBILE_VERIFY` / `EMAIL_VERIFY`) so issuing a CRM-side OTP correctly
 * supersedes any in-flight customer-side OTP.
 *
 * Email endpoints are rate-limited 5/min/IP matching the user-side flow
 * to deter SMTP abuse.
 */
crmCustomersRoutes.post(
  "/api/crm/customer/:customerId/mobile/send-otp",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.sendCustomerMobileVerifyOtp(req, res),
);
crmCustomersRoutes.post(
  "/api/crm/customer/:customerId/mobile/verify-otp",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.verifyCustomerMobileOtp(req, res),
);
crmCustomersRoutes.post(
  "/api/crm/customer/:customerId/email/send-otp",
  allowAccessMiddleware("CRM"),
  withRateLimit({ max: 5 }),
  (req, res) => controller.sendCustomerEmailVerifyOtp(req, res),
);
crmCustomersRoutes.post(
  "/api/crm/customer/:customerId/email/verify-otp",
  allowAccessMiddleware("CRM"),
  withRateLimit({ max: 5 }),
  (req, res) => controller.verifyCustomerEmailOtp(req, res),
);

crmCustomersRoutes.get(
  "/api/crm/customer/:customerId/corporate-kyc/pdf",
  allowAccessMiddleware("ADMIN", "USER"),
  (req, res) => controller.downloadCorporateKycPdf(req, res)
);

/**
 * Persist the S3 URL of the most recently generated corporate KYC PDF.
 * Called by the CRM PDF page immediately after a successful render so the
 * "Download last PDF" button on the same page can read it from
 * `getCorporateKyc`.
 */
crmCustomersRoutes.post(
  "/api/crm/customer/:customerId/corporate-kyc/last-pdf",
  allowAccessMiddleware("ADMIN", "USER"),
  (req, res) => controller.setCorporateKycLastPdf(req, res),
);

/**
 * Persist the CRM PDF editor JSON form payload on the corporate KYC row.
 */
crmCustomersRoutes.put(
  "/api/crm/customer/:customerId/corporate-kyc/pdf-payload",
  allowAccessMiddleware("ADMIN", "USER"),
  (req, res) => controller.setCorporateKycPdfPayload(req, res),
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

/**
 * Verify & activate a corporate customer in one click:
 *  - copies corporate KYC -> customer satellites (PAN, addresses, banks,
 *    demats, personalInfo.annualGrossIncome, FATCA flag) — fill-missing-only
 *  - flips kycStatus + kraStatus to VERIFIED with verifyDate + VerifiedBy
 *  - appends a MANUAL_VERIFIED_BY_CRM row to kraDataLogs
 * Idempotent: 409 if the customer is already VERIFIED.
 */
crmCustomersRoutes.post(
  "/api/crm/customer/:customerId/corporate-kyc/verify",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.verifyCorporateCustomer(req, res),
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

// --- Corporate KYC e-sign requests ---
crmCustomersRoutes.get(
  "/api/crm/customer/:customerId/corporate-kyc/e-sign-requests",
  allowAccessMiddleware("ADMIN", "USER"),
  (req, res) => controller.listCorporateESignRequests(req, res),
);

crmCustomersRoutes.post(
  "/api/crm/customer/:customerId/corporate-kyc/e-sign-requests",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.createCorporateESignRequest(req, res),
);

crmCustomersRoutes.patch(
  "/api/crm/customer/:customerId/corporate-kyc/e-sign-requests/:requestId",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.updateCorporateESignRequest(req, res),
);

crmCustomersRoutes.delete(
  "/api/crm/customer/:customerId/corporate-kyc/e-sign-requests/:requestId",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.deleteCorporateESignRequest(req, res),
);

export default crmCustomersRoutes;
