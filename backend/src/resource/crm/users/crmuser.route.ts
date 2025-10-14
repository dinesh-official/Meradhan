import { Router } from 'express';

import { withAuthMiddleware } from '@lib/middlewares/auth.middleware';
import { CrmUserController } from './crmusers.controller';
import { CrmUserRepo } from './crmusers.repo';
import { CrmUserService } from './crmusers.service';

const crmUsersRoutes = Router();
const userRepo = new CrmUserRepo();
const userService = new CrmUserService(userRepo);
const controller = new CrmUserController(userService)

crmUsersRoutes.post("/api/crm/user", withAuthMiddleware, (req, res) => controller.createNewUser(req, res))
crmUsersRoutes.get("/api/crm/user/:id", withAuthMiddleware, (req, res) => controller.findUser(req, res))
crmUsersRoutes.patch("/api/crm/user/:id", withAuthMiddleware, (req, res) => controller.updateUser(req, res))
crmUsersRoutes.delete("/api/crm/user/:id", withAuthMiddleware, (req, res) => controller.deleteUser(req, res))
crmUsersRoutes.get("/api/crm/users", withAuthMiddleware, (req, res) => controller.findManyUser(req, res))

export default crmUsersRoutes;