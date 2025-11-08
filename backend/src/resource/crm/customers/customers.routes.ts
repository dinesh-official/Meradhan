import { withCrmAuthMiddleware } from "@middlewares/crm_middleware";
import { Router } from "express";
import { CustomerProfileController } from "./customer.controller";


const crmCustomersRoutes = Router();
const controller = new CustomerProfileController()

crmCustomersRoutes.get("/api/crm/customers", withCrmAuthMiddleware, (req, res) => controller.filterCustomer(req, res));
crmCustomersRoutes.get("/api/crm/customer/:customerId", (req, res) => controller.getFullProfileCustomer(req, res));
crmCustomersRoutes.post("/api/crm/customer", withCrmAuthMiddleware, (req, res) => controller.createCustomer(req, res));
crmCustomersRoutes.patch("/api/crm/customer/:customerId", withCrmAuthMiddleware, (req, res) => controller.updateCustomer(req, res));
crmCustomersRoutes.delete("/api/crm/customer/:customerId", withCrmAuthMiddleware, (req, res) => controller.deleteCustomer(req, res));

export default crmCustomersRoutes