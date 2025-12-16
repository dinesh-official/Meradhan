import { Router } from "express";
import { AuthController } from "./auth.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
const crmAuthRoutes = Router();
const controller = new AuthController();

crmAuthRoutes.post("/api/auth/login-with-otp", (req, res) =>
  controller.loginWithOtp(req, res)
);
crmAuthRoutes.post("/api/auth/verify-otp", (req, res) =>
  controller.verifyLoginOtp(req, res)
);
crmAuthRoutes.all("/api/auth/logout", (req, res) =>
  controller.logout(req, res)
);
crmAuthRoutes.all("/api/session", allowAccessMiddleware("ADMIN"), (req, res) =>
  controller.session(req, res)
);

export default crmAuthRoutes;
