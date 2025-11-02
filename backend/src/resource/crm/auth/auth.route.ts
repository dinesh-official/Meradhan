
import { withCrmAuthMiddleware } from '@middlewares/crm_middleware';
import { Router } from 'express';
import { AuthController } from './auth.controller';
const crmAuthRoutes = Router();
const controller = new AuthController()

crmAuthRoutes.post("/api/auth/login-with-otp", (req, res) => controller.loginWithOtp(req, res))
crmAuthRoutes.post("/api/auth/verify-otp", (req, res) => controller.verifyLoginOtp(req, res))
crmAuthRoutes.all("/api/auth/logout", (req, res) => controller.logout(req, res))
crmAuthRoutes.all("/api/session", withCrmAuthMiddleware, (req, res) => controller.session(req, res))

export default crmAuthRoutes;