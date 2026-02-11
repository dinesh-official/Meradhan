import { Router } from "express";
import { NSEIsinController } from "./nseisin.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
const nseIsinRoute = Router();

const controller = new NSEIsinController();

nseIsinRoute.get(
  "/api/crm/rfq/nse/isin",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.searchIsin(req, res)
);

export default nseIsinRoute;
