import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { withRateLimit } from "@middlewares/ratelimit_midddleare";
import { Router } from "express";
import { CustomerProfileController } from "./customer.profile.controller";

const customerProfileRoutes = Router();
const controller = new CustomerProfileController();

customerProfileRoutes.post(
  "/api/auth/customer/profile/mobile",
  allowAccessMiddleware("USER"),
  (req, res) => controller.requestMobileUpdate(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/mobile/send-otp",
  allowAccessMiddleware("USER"),
  (req, res) => controller.sendMobileOtpVerification(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/mobile/verify",
  allowAccessMiddleware("USER"),
  (req, res) => controller.verifyAndUpdateMobile(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/email-verification/send-otp",
  allowAccessMiddleware("USER"),
  withRateLimit({ max: 5 }),
  (req, res) => controller.sendEmailVerifyOtp(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/email-verification/verify",
  allowAccessMiddleware("USER"),
  withRateLimit({ max: 5 }),
  (req, res) => controller.verifyEmailVerifyOtp(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/email/send-otp",
  allowAccessMiddleware("USER"),
  withRateLimit({ max: 5 }),
  (req, res) => controller.sendEmailChangeOtp(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/email/verify",
  allowAccessMiddleware("USER"),
  withRateLimit({ max: 5 }),
  (req, res) => controller.verifyEmailChange(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/whatsapp",
  allowAccessMiddleware("USER"),
  (req, res) => controller.toggleWhatsAppPreference(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/bank-account",
  allowAccessMiddleware("USER"),
  (req, res) => controller.addBankAccount(req, res),
);
customerProfileRoutes.delete(
  "/api/auth/customer/profile/bank-account/:bankAccountId",
  allowAccessMiddleware("USER"),
  (req, res) => controller.removeBankAccount(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/bank-account/primary/:bankAccountId",
  allowAccessMiddleware("USER"),
  (req, res) => controller.setPrimaryBankAccount(req, res),
);

customerProfileRoutes.post(
  "/api/auth/customer/profile/demat-account",
  allowAccessMiddleware("USER"),
  (req, res) => controller.addNewDematAccount(req, res),
);

customerProfileRoutes.delete(
  "/api/auth/customer/profile/demat-account/:dematAccountId",
  allowAccessMiddleware("USER"),
  (req, res) => controller.removeDematAccount(req, res),
);

customerProfileRoutes.post(
  "/api/auth/customer/profile/demat-account/primary/:dematAccountId",
  allowAccessMiddleware("USER"),
  (req, res) => controller.setPrimaryDematAccount(req, res),
);

customerProfileRoutes.post(
  "/api/auth/customer/profile/risk-profile",
  allowAccessMiddleware("USER"),
  (req, res) => controller.saveRiskProfileAnswers(req, res),
);

// ---------------------------------------------------------------------------
// Corporate KYC e-sign (Digio) — customer-facing routes.
//
// The CRM operator still creates the request via `/crm/.../e-sign-requests`
// (see `crm/customers/customers.routes.ts`). These four endpoints power the
// meradhan dashboard banner + 2-step sign page so the customer can sign the
// CRM-uploaded PDF through Digio themselves. The questions endpoint is a
// helper so the meradhan client doesn't have to duplicate question text —
// it returns the same `CORPORATE_RISK_PROFILE_QUESTIONS` constant the CRM
// uses, and the submission goes through the existing `/risk-profile` POST.
// ---------------------------------------------------------------------------

customerProfileRoutes.get(
  "/api/auth/customer/corporate-kyc/risk-profile/questions",
  allowAccessMiddleware("USER"),
  (req, res) => controller.getCorporateRiskProfileQuestions(req, res),
);

customerProfileRoutes.get(
  "/api/auth/customer/corporate-kyc/e-sign-requests/pending",
  allowAccessMiddleware("USER"),
  (req, res) => controller.listPendingCorporateESignRequests(req, res),
);

customerProfileRoutes.get(
  "/api/auth/customer/corporate-kyc/e-sign-requests/:requestId",
  allowAccessMiddleware("USER"),
  (req, res) => controller.getCorporateESignRequest(req, res),
);

customerProfileRoutes.post(
  "/api/auth/customer/corporate-kyc/e-sign-requests/:requestId/digio-request",
  allowAccessMiddleware("USER"),
  withRateLimit({ max: 10 }),
  (req, res) => controller.digioRequestCorporateESign(req, res),
);

customerProfileRoutes.post(
  "/api/auth/customer/corporate-kyc/e-sign-requests/:requestId/digio-verify",
  allowAccessMiddleware("USER"),
  withRateLimit({ max: 10 }),
  (req, res) => controller.digioVerifyCorporateESign(req, res),
);

export default customerProfileRoutes;
