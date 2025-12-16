import { Router } from "express";
import { CustomerProfileController } from "./customer.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const crmCustomersRoutes = Router();
const controller = new CustomerProfileController();

crmCustomersRoutes.get(
  "/api/crm/customers",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.filterCustomer(req, res)
);

crmCustomersRoutes.get(
  "/api/crm/customer/:customerId",
  allowAccessMiddleware("ADMIN", "USER"),
  (req, res) => controller.getFullProfileCustomer(req, res)
);

crmCustomersRoutes.post(
  "/api/crm/customer",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.createCustomer(req, res)
);
crmCustomersRoutes.patch(
  "/api/crm/customer/:customerId",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.updateCustomer(req, res)
);
crmCustomersRoutes.delete(
  "/api/crm/customer/:customerId",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.softDeleteCustomer(req, res)
);
crmCustomersRoutes.delete(
  "/api/crm/customer/force/:customerId",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.deleteCustomer(req, res)
);

export default crmCustomersRoutes;
