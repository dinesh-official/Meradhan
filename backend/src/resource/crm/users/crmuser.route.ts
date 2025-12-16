import { Router } from "express";
import { CrmUserController } from "./crmusers.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const crmUsersRoutes = Router();
const controller = new CrmUserController();

crmUsersRoutes.post(
  "/api/crm/user",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.createNewUser(req, res)
);
crmUsersRoutes.get(
  "/api/crm/user/:id",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.findUser(req, res)
);
crmUsersRoutes.patch(
  "/api/crm/user/:id",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.updateUser(req, res)
);
crmUsersRoutes.delete(
  "/api/crm/user/:id",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.deleteUser(req, res)
);
crmUsersRoutes.get(
  "/api/crm/users",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.findManyUser(req, res)
);

export default crmUsersRoutes;
