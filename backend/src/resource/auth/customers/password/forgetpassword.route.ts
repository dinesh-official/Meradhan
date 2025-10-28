import { Router } from 'express';
import { ForgetPasswordController } from './forgetpassword.controller';

const customerResetPasswordAuthRoutes = Router();
const controller = new ForgetPasswordController();

customerResetPasswordAuthRoutes.post("/api/auth/customer/send-forget-password", (req, res) => controller.sendForgetPassword(req, res))
customerResetPasswordAuthRoutes.post("/api/auth/customer/reset-password", (req, res) => controller.resetPassword(req, res))

export default customerResetPasswordAuthRoutes;