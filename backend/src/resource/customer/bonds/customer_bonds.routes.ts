import { Router } from "express";
import { CustomerBondsController } from "./customer_bonds.controller";
import { customerAuthMiddleware } from "@middlewares/customer_middleware";

const customerBondsRoutes = Router();
const customerBondsController = new CustomerBondsController();

customerBondsRoutes.get(
  "/api/customer/bonds",
  customerAuthMiddleware,
  customerBondsController.getCustomerBonds
);

export default customerBondsRoutes;

