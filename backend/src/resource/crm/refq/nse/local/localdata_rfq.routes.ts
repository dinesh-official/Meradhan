import { withCrmAuthMiddleware } from "@middlewares/crm_middleware";
import { Router } from "express";
import { LocaldataRfqController } from "./localdata_rfq.controller";

export const local_data_rfq_routes = Router();
const controller = new LocaldataRfqController();
// Define your local_data_rfq_routes here
// Example:
local_data_rfq_routes.get(
  "/api/crm/rfq/nse/localdata",
  withCrmAuthMiddleware,
  controller.getLocaldataRfq.bind(controller)
);

export default local_data_rfq_routes;
