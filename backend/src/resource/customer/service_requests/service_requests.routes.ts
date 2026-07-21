import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { CustomerServiceRequestController } from "./service_requests.controller";

const customerServiceRequestsRoutes = Router();
const controller = new CustomerServiceRequestController();

customerServiceRequestsRoutes.get(
  "/api/customer/service-requests/reasons",
  allowAccessMiddleware("USER"),
  (req, res) => controller.listReasons(req, res),
);

customerServiceRequestsRoutes.post(
  "/api/customer/service-requests",
  allowAccessMiddleware("USER"),
  (req, res) => controller.createRequest(req, res),
);

customerServiceRequestsRoutes.get(
  "/api/customer/service-requests",
  allowAccessMiddleware("USER"),
  (req, res) => controller.listMyRequests(req, res),
);

export default customerServiceRequestsRoutes;
