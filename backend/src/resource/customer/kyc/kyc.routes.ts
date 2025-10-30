import { customerAuthMiddleware } from "@lib/middlewares/customer.middleware";
import { Router } from "express";
import { PersonalDetailsKycController } from "./personal_info/PersonalDetailsKyc.controller";
import { KycStoreController } from "./store/kycStore.controller";

const kycRoutes = Router();
const controller = new PersonalDetailsKycController();
const storeKyc = new KycStoreController();


kycRoutes.post("/api/customer/kyc/pan/request", customerAuthMiddleware, (req, res) => controller.createPanVerifyRequest(req, res));
kycRoutes.get("/api/customer/kyc/pan/response/:kid", customerAuthMiddleware, (req, res) => controller.verifyPanResponse(req, res));

// selfie
kycRoutes.post("/api/customer/kyc/selfie/request", customerAuthMiddleware, (req, res) => controller.createSelfieVerifyRequest(req, res));
kycRoutes.get("/api/customer/kyc/selfie/response/:kid", customerAuthMiddleware, (req, res) => controller.verifySelfieResponse(req, res));

// sign
kycRoutes.post("/api/customer/kyc/sign/request", customerAuthMiddleware, (req, res) => controller.createSignVerifyRequest(req, res));
kycRoutes.get("/api/customer/kyc/sign/response/:kid", customerAuthMiddleware, (req, res) => controller.verifySignResponse(req, res));

// bank
kycRoutes.post("/api/customer/kyc/bank/verify", customerAuthMiddleware, (req, res) => controller.verifyBankAccount(req, res));

// for storage
kycRoutes.get("/api/customer/kyc/store/get", customerAuthMiddleware, (req, res) => storeKyc.getKycData(req, res));
kycRoutes.post("/api/customer/kyc/store/:step", customerAuthMiddleware, (req, res) => storeKyc.setKycData(req, res));
kycRoutes.get("/api/bank/:ifsc", (req, res) => controller.fetchIfscInfo(req, res));


export default kycRoutes