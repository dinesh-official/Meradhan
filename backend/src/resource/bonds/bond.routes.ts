import { Router } from "express";
import { BondController } from "./bond.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const bondController = new BondController();
const bondRoute = Router();
bondRoute.get("/api/bonds/ongoing-deals", (req, res) =>
  bondController.getOngoingDeals(req, res)
);
bondRoute.get("/api/bonds/latest", (req, res) =>
  bondController.getLatestListedBonds(req, res)
);
bondRoute.get("/api/latest", (req, res) =>
  bondController.getLatestListedBonds(req, res)
);

bondRoute.get("/api/bonds/search", (req, res) =>
  bondController.autocompleteBondSearch(req, res)
);

bondRoute.get("/api/bonds/upcoming", (req, res) =>
  bondController.getUpcomingListedBonds(req, res)
);

bondRoute.post("/api/bonds/listed/filter", (req, res) =>
  bondController.filterListedBonds(req, res)
);

bondRoute.get("/api/bonds/:isin", (req, res) =>
  bondController.getBondDetails(req, res)
);

bondRoute.post("/api/bonds", allowAccessMiddleware("CRM"), (req, res) =>
  bondController.createBond(req, res)
);

bondRoute.put("/api/bonds/:isin", allowAccessMiddleware("CRM"), (req, res) =>
  bondController.updateBond(req, res)
);


export default bondRoute;
