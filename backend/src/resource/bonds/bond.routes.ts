import { Router } from "express";
import { BondController } from "./bond.controller";

const bondController = new BondController();
const bondRoute = Router();

bondRoute.get("/api/bonds/:isin", (req, res) => bondController.getBondDetails(req, res));
bondRoute.post("/api/bonds/listed/filter", (req, res) => bondController.filterListedBonds(req, res));

export default bondRoute;