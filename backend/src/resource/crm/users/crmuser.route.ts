import { Router } from 'express';
import { CrmUserController } from './crmusers.controller';
import { withCrmAuthMiddleware } from '@middlewares/crm_middleware';

const crmUsersRoutes = Router();
const controller = new CrmUserController()

crmUsersRoutes.post("/api/crm/user", withCrmAuthMiddleware, (req, res) => controller.createNewUser(req, res))
crmUsersRoutes.get("/api/crm/user/:id", withCrmAuthMiddleware, (req, res) => controller.findUser(req, res))
crmUsersRoutes.patch("/api/crm/user/:id", withCrmAuthMiddleware, (req, res) => controller.updateUser(req, res))
crmUsersRoutes.delete("/api/crm/user/:id", withCrmAuthMiddleware, (req, res) => controller.deleteUser(req, res))
crmUsersRoutes.get("/api/crm/users", withCrmAuthMiddleware, (req, res) => controller.findManyUser(req, res))

export default crmUsersRoutes;