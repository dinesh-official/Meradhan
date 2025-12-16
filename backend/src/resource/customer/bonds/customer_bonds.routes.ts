import { Router } from "express";
import { CustomerBondsController } from "./customer_bonds.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const customerBondsRoutes = Router();
const customerBondsController = new CustomerBondsController();

customerBondsRoutes.get(
  "/api/customer/bonds",
  allowAccessMiddleware("USER"),
  customerBondsController.getCustomerBonds
);

export default customerBondsRoutes;
