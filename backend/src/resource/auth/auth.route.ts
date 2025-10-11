import { Router } from 'express';
const authRoutes = Router();

import { withAuthMiddleware } from '@lib/middlewares/auth.middleware';
import { AuthController } from './auth.controller';
import { AuthRepo } from './auth.repo';
import { JwtAuthService } from './JwtAuth.service';

const authRepo = new AuthRepo();
const authService = new JwtAuthService(authRepo);
export const authController = new AuthController(authService);

authRoutes.post("/api/auth/login", (req, res) => authController.login(req, res));
authRoutes.post("/api/auth/register", (req, res) => authController.register(req, res));
authRoutes.get("/api/auth/logout", (req, res) => authController.logout(req, res));
authRoutes.get("/api/session", withAuthMiddleware, (req, res) => authController.session(req, res));
authRoutes.get("/", (req, res) => {
    console.log(req.headers);
    res.send("ok")
});


export default authRoutes;