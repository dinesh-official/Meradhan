import { Router } from "express";
import { TrashController } from "./trash.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const trashRoutes = Router();
const controller = new TrashController();

trashRoutes.get(
  "/api/trash/customers",
  allowAccessMiddleware("ADMIN"),
  (req, res) => {
    controller.getAllTrashCustomers(req, res);
  }
);

trashRoutes.post(
  "/api/trash/customers/:customerId/restore",
  allowAccessMiddleware("ADMIN"),
  (req, res) => {
    controller.restoreCustomer(req, res);
  }
);

trashRoutes.delete(
  "/api/trash/customers/:customerId",
  allowAccessMiddleware("ADMIN"),
  (req, res) => {
    controller.deleteCustomerPermanently(req, res);
  }
);

export default trashRoutes;
