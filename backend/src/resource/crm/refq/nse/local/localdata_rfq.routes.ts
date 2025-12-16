import { Router } from "express";
import { LocaldataRfqController } from "./localdata_rfq.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

export const local_data_rfq_routes = Router();
const controller = new LocaldataRfqController();
// Define your local_data_rfq_routes here
// Example:
local_data_rfq_routes.get(
  "/api/crm/rfq/nse/localdata",
  allowAccessMiddleware("ADMIN"),
  controller.getLocaldataRfq.bind(controller)
);

export default local_data_rfq_routes;
