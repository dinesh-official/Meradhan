import { Router } from "express";
import { CustomerKycKycController } from "./kyc_process/customer_kyc.controller";
import { KycStoreController } from "./store/kyc_store.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const kycRoutes = Router();
const controller = new CustomerKycKycController();

// pan
kycRoutes.post(
  "/api/customer/kyc/pan/info-verify",
  allowAccessMiddleware("USER"),
  (req, res) => controller.panInfoVerifyRequest(req, res)
);

kycRoutes.post(
  "/api/customer/kyc/pan/request",
  allowAccessMiddleware("USER"),
  (req, res) => controller.createPanVerifyRequest(req, res)
);

kycRoutes.get(
  "/api/customer/kyc/pan/response/:kid",
  allowAccessMiddleware("USER"),
  (req, res) => controller.verifyPanResponse(req, res)
);
// aadhaar
kycRoutes.post(
  "/api/customer/kyc/aadhaar/request",
  allowAccessMiddleware("USER"),
  (req, res) => controller.createAadhaarVerifyRequest(req, res)
);

kycRoutes.post(
  "/api/customer/kyc/kra/request",
  allowAccessMiddleware("USER"),
  (req, res) => controller.createKraVerifyRequest(req, res)
);

// selfie verify request
kycRoutes.post(
  "/api/customer/kyc/selfie/request",
  allowAccessMiddleware("USER"),
  (req, res) => controller.createSelfieVerifyRequest(req, res)
);
// selfie verify response
kycRoutes.get(
  "/api/customer/kyc/selfie/response/:kid",
  allowAccessMiddleware("USER"),
  (req, res) => controller.verifySelfieResponse(req, res)
);
// sign verify request
kycRoutes.post(
  "/api/customer/kyc/sign/request",
  allowAccessMiddleware("USER"),
  (req, res) => controller.createSignVerifyRequest(req, res)
);
// sign verify response
kycRoutes.get(
  "/api/customer/kyc/sign/response/:kid",
  allowAccessMiddleware("USER"),
  (req, res) => controller.verifySignResponse(req, res)
);

// bank
kycRoutes.get("/api/bank/:ifsc", (req, res) =>
  controller.fetchIfscInfo(req, res)
);
kycRoutes.post(
  "/api/customer/kyc/bank/verify",
  allowAccessMiddleware("USER"),
  (req, res) => controller.verifyBankAccount(req, res)
);
kycRoutes.post(
  "/api/customer/kyc/demat/submit",
  allowAccessMiddleware("USER"),
  (req, res) => controller.verifyDematAccount(req, res)
);

// esign
kycRoutes.post(
  "/api/customer/kyc/esign/request",
  allowAccessMiddleware("USER"),
  (req, res) => controller.getEsignRequest(req, res)
);
kycRoutes.get(
  "/api/customer/kyc/esign/verify/:doc",
  allowAccessMiddleware("USER"),
  (req, res) => controller.verifyEsignResponse(req, res)
);

// for storage
const storeKyc = new KycStoreController();
kycRoutes.get(
  "/api/customer/kyc/store/get",
  allowAccessMiddleware("USER"),
  (req, res) => storeKyc.getKycData(req, res)
);
kycRoutes.post(
  "/api/customer/kyc/store/:step",
  allowAccessMiddleware("USER"),
  (req, res) => storeKyc.setKycData(req, res)
);
kycRoutes.get(
  "/api/customer/kyc/level/:customerId",
  allowAccessMiddleware("CRM", "USER"),
  (req, res) => storeKyc.getKycLevel(req, res)
);
kycRoutes.post(
  "/api/customer/kyc/audit-log/:customerId",
  allowAccessMiddleware("USER"),
  (req, res) => storeKyc.addAuditLog(req, res)
);
kycRoutes.post(
  "/api/customer/kyc/current-step/:customerId",
  allowAccessMiddleware("USER"),
  (req, res) => storeKyc.setCurrentStep(req, res)
);
kycRoutes.get(
  "/api/customer/kyc/download-pdf/:id",
  allowAccessMiddleware("CRM", "USER"),
  (req, res) => controller.downloadKycPdf(req, res)
);
// for crm access - ADMIN and SUPER_ADMIN can view customer KYC data
kycRoutes.get(
  "/api/crm/kyc/store/get/:customerId",
  allowAccessMiddleware("ADMIN", "SUPER_ADMIN"),
  (req, res) => storeKyc.getKycDataById(req, res)
);
kycRoutes.get(
  "/api/crm/kyc/kra/get/:customerId",
  allowAccessMiddleware("ADMIN", "SUPER_ADMIN"),
  (req, res) => storeKyc.getKycKraDataById(req, res),
);
kycRoutes.get(
  "/api/crm/kyc/rekyc/:customerId",
  allowAccessMiddleware("ADMIN", "SUPER_ADMIN"),
  (req, res) => storeKyc.applyRekyc(req, res),
);
kycRoutes.post(
  "/api/crm/kyc/rekyc/request-otp/:customerId",
  allowAccessMiddleware("ADMIN", "SUPER_ADMIN"),
  (req, res) => storeKyc.requestRekycOtp(req, res),
);
kycRoutes.post(
  "/api/crm/kyc/rekyc/confirm",
  allowAccessMiddleware("ADMIN", "SUPER_ADMIN"),
  (req, res) => storeKyc.confirmRekyc(req, res),
);

export default kycRoutes;
