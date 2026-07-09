import { Router } from "express";
import { LocaldataRfqController } from "./localdata_rfq.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const localDataRfqRoutes = Router();
const controller = new LocaldataRfqController();

localDataRfqRoutes.get(
  "/api/crm/rfq/nse/localdata",
  allowAccessMiddleware("CRM"),
  controller.getLocaldataRfq.bind(controller)
);

export default localDataRfqRoutes;
