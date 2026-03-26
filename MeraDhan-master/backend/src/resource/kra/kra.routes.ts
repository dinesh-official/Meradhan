import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { KraController } from "./kra.controller";

const kraRoutes = Router();
const controller = new KraController();

kraRoutes.post(
  "/api/kra/reschedule-kra",
  allowAccessMiddleware("ADMIN", "SUPER_ADMIN"),
  (req, res) => controller.rescheduleKra(req, res)
);

export default kraRoutes;
