import { Router } from "express";
import { CustomerProfileController } from "./customer.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const crmCustomersRoutes = Router();
const controller = new CustomerProfileController();

crmCustomersRoutes.get(
  "/api/crm/customers",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.filterCustomer(req, res)
);

crmCustomersRoutes.get(
  "/api/crm/customer/:customerId",
  allowAccessMiddleware("CRM", "USER"),
  (req, res) => controller.getFullProfileCustomer(req, res)
);

crmCustomersRoutes.get(
  "/api/crm/customer/participant/:participantCode",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.getCustomerByParticipantCode(req, res)
);
crmCustomersRoutes.post(
  "/api/crm/customer",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.createCustomer(req, res)
);
crmCustomersRoutes.patch(
  "/api/crm/customer/:customerId",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.updateCustomer(req, res)
);
crmCustomersRoutes.delete(
  "/api/crm/customer/:customerId",
  allowAccessMiddleware("SUPER_ADMIN"),
  (req, res) => controller.softDeleteCustomer(req, res)
);
crmCustomersRoutes.delete(
  "/api/crm/customer/force/:customerId",
  allowAccessMiddleware("SUPER_ADMIN"),
  (req, res) => controller.deleteCustomer(req, res)
);

crmCustomersRoutes.get(
  "/api/crm/customer/:customerId/corporate-kyc",
  allowAccessMiddleware("ADMIN", "USER"),
  (req, res) => controller.getCorporateKyc(req, res)
);

crmCustomersRoutes.put(
  "/api/crm/customer/:customerId/corporate-kyc",
  allowAccessMiddleware("ADMIN"),
  (req, res) => controller.saveCorporateKyc(req, res)
);

export default crmCustomersRoutes;
