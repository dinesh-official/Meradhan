import { Router } from "express";
import { CustomerProfileController } from "./customer.controller";
import { withAuthMiddleware } from "@lib/middlewares/auth.middleware";

const customersRoutes = Router();
const controller = new CustomerProfileController()

customersRoutes.get("/api/crm/customers", withAuthMiddleware, (req, res) => controller.filterCustomer(req, res));
customersRoutes.get("/api/crm/customer/:customerId", withAuthMiddleware, (req, res) => controller.getFullProfileCustomer(req, res));
customersRoutes.post("/api/crm/customer", withAuthMiddleware, (req, res) => controller.createCustomer(req, res));
customersRoutes.patch("/api/crm/customer/:customerId", withAuthMiddleware, (req, res) => controller.updateCustomer(req, res));
customersRoutes.delete("/api/crm/customer/:customerId", withAuthMiddleware, (req, res) => controller.deleteCustomer(req, res));

export default customersRoutes