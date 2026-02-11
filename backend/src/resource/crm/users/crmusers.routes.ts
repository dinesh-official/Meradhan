import { Router } from "express";
import { CrmUserController } from "./crmusers.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const crmUsersRoutes = Router();
const controller = new CrmUserController();

const CRM_ROLES = ["ADMIN", "SUPER_ADMIN", "VIEWER", "SALES", "SUPPORT", "RELATIONSHIP_MANAGER"] as const;

crmUsersRoutes.post(
  "/api/crm/user",
  allowAccessMiddleware(...CRM_ROLES),
  (req, res) => controller.createNewUser(req, res)
);
crmUsersRoutes.get(
  "/api/crm/user/:id",
  allowAccessMiddleware(...CRM_ROLES),
  (req, res) => controller.findUser(req, res)
);
crmUsersRoutes.patch(
  "/api/crm/user/:id",
  allowAccessMiddleware("SUPER_ADMIN"),
  (req, res) => controller.updateUser(req, res)
);
crmUsersRoutes.delete(
  "/api/crm/user/:id",
  allowAccessMiddleware("SUPER_ADMIN"),
  (req, res) => controller.deleteUser(req, res)
);
crmUsersRoutes.get(
  "/api/crm/users",
  allowAccessMiddleware(...CRM_ROLES),
  (req, res) => controller.findManyUser(req, res)
);
crmUsersRoutes.get(
  "/api/crm/users/summary",
  allowAccessMiddleware(...CRM_ROLES),
  (req, res) => controller.getSummary(req, res)
);

export default crmUsersRoutes;
