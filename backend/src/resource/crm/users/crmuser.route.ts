import { Router } from 'express';
import { withAuthMiddleware } from '@lib/middlewares/auth.middleware';
import { CrmUserController } from './crmusers.controller';

const crmUsersRoutes = Router();
const controller = new CrmUserController()

crmUsersRoutes.post("/api/crm/user", withAuthMiddleware, (req, res) => controller.createNewUser(req, res))
crmUsersRoutes.get("/api/crm/user/:id", withAuthMiddleware, (req, res) => controller.findUser(req, res))
crmUsersRoutes.patch("/api/crm/user/:id", withAuthMiddleware, (req, res) => controller.updateUser(req, res))
crmUsersRoutes.delete("/api/crm/user/:id", withAuthMiddleware, (req, res) => controller.deleteUser(req, res))
crmUsersRoutes.get("/api/crm/users", withAuthMiddleware, (req, res) => controller.findManyUser(req, res))

export default crmUsersRoutes;