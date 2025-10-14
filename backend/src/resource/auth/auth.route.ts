import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthRepo } from './auth.repo';
import { EmailAuthService } from './services/EmailAuth.service';
const authRoutes = Router();

const authRepo = new AuthRepo();
const authService = new EmailAuthService(authRepo);
const controller = new AuthController(authService)

authRoutes.post("/api/auth/login-with-otp", (req, res) => controller.loginWithOtp(req, res))
authRoutes.post("/api/auth/verify-otp", (req, res) => controller.verifyLoginOtp(req, res))

export default authRoutes;