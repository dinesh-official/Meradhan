import { Router } from "express";
import { CustomerKycKycController } from "./kyc_process/customer_kyc.controller";
import { KycStoreController } from "./store/kyc_store.controller";
import { customerAuthMiddleware } from "@middlewares/customer_middleware";

const kycRoutes = Router();
const controller = new CustomerKycKycController();


// pan
kycRoutes.post("/api/customer/kyc/pan/request", customerAuthMiddleware, (req, res) => controller.createPanVerifyRequest(req, res));
kycRoutes.get("/api/customer/kyc/pan/response/:kid", customerAuthMiddleware, (req, res) => controller.verifyPanResponse(req, res));

// selfie
kycRoutes.post("/api/customer/kyc/selfie/request", customerAuthMiddleware, (req, res) => controller.createSelfieVerifyRequest(req, res));
kycRoutes.get("/api/customer/kyc/selfie/response/:kid", customerAuthMiddleware, (req, res) => controller.verifySelfieResponse(req, res));

// sign
kycRoutes.post("/api/customer/kyc/sign/request", customerAuthMiddleware, (req, res) => controller.createSignVerifyRequest(req, res));
kycRoutes.get("/api/customer/kyc/sign/response/:kid", customerAuthMiddleware, (req, res) => controller.verifySignResponse(req, res));

// bank
kycRoutes.get("/api/bank/:ifsc", (req, res) => controller.fetchIfscInfo(req, res));
kycRoutes.post("/api/customer/kyc/bank/verify", customerAuthMiddleware, (req, res) => controller.verifyBankAccount(req, res));
kycRoutes.post("/api/customer/kyc/demat/submit", customerAuthMiddleware, (req, res) => controller.verifyDematAccount(req, res));

// esign
kycRoutes.post("/api/customer/kyc/esign/request", customerAuthMiddleware, (req, res) => controller.getEsignRequest(req, res));
kycRoutes.get("/api/customer/kyc/esign/verify/:doc", customerAuthMiddleware, (req, res) => controller.verifyEsignResponse(req, res));

// for storage
const storeKyc = new KycStoreController();
kycRoutes.get("/api/customer/kyc/store/get", customerAuthMiddleware, (req, res) => storeKyc.getKycData(req, res));
kycRoutes.post("/api/customer/kyc/store/:step", customerAuthMiddleware, (req, res) => storeKyc.setKycData(req, res));
kycRoutes.get("/api/customer/kyc/level/:customerId", (req, res) => storeKyc.setKycLevel(req, res));
kycRoutes.post("/api/customer/kyc/audit-log/:customerId", customerAuthMiddleware, (req, res) => storeKyc.addAuditLog(req, res));
kycRoutes.post("/api/customer/kyc/current-step/:customerId", customerAuthMiddleware, (req, res) => storeKyc.setCurrentStep(req, res));
kycRoutes.get("/api/customer/kyc/download-pdf/:id",  (req, res) => controller.downloadKycPdf(req, res));



export default kycRoutes