import { Router } from "express";
import { CommonApiController } from "./controller";

const commonApiRoutes = Router();
const commonApiController = new CommonApiController();

commonApiRoutes.post("/api/contact/submit", (req, res) =>
  commonApiController.contactSubmit(req, res)
);

export default commonApiRoutes;
