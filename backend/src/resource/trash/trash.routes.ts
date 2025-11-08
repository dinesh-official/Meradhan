import { Router } from "express";
import { TrashController } from "./trash.controller";
import { withCrmAuthMiddleware } from "@middlewares/crm_middleware";

const trashRoutes = Router();
const controller = new TrashController();

trashRoutes.get("/api/trash/customers", withCrmAuthMiddleware, (req, res) => {
    controller.getAllTrashCustomers(req, res);
});

trashRoutes.post("/api/trash/customers/:customerId/restore", withCrmAuthMiddleware, (req, res) => {
    controller.restoreCustomer(req, res);
});

trashRoutes.delete("/api/trash/customers/:customerId", withCrmAuthMiddleware, (req, res) => {
    controller.deleteCustomerPermanently(req, res);
});

export default trashRoutes;