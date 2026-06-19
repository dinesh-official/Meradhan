import { Router } from "express";
import { BondController } from "./bond.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const bondController = new BondController();
const bondRoute = Router();
bondRoute.get("/api/bonds/homepage", (req, res) =>
  bondController.getHomepageBonds(req, res)
);
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

bondRoute.get("/api/bonds/high-yield", (req, res) =>
  bondController.getHighYieldListedBonds(req, res)
);

bondRoute.get("/api/bonds/zero-coupon", (req, res) =>
  bondController.getZeroCouponListedBonds(req, res)
);

bondRoute.post("/api/bonds/listed/filter", (req, res) =>
  bondController.filterListedBonds(req, res)
);

// [Ticket: Maturity and Credit Rating dropdown filters should display only bonds we hold]
bondRoute.get("/api/bonds/filter-options", (req, res) =>
  bondController.getBondFilterOptions(req, res)
);

bondRoute.get("/api/bonds/:isin/order-pricing", (req, res) =>
  bondController.getBondOrderPricing(req, res),
);

bondRoute.get("/api/bonds/:isin/deal-autofill", (req, res) =>
  bondController.getBondDealAutofill(req, res),
);
/** Same as GET; use POST when sending `pricingYield` in the JSON body (avoids query-string params). */
bondRoute.post("/api/bonds/:isin/deal-autofill", (req, res) =>
  bondController.getBondDealAutofill(req, res),
);

/** CRM bond auto-update: calc-based autofill (new API). */
bondRoute.get("/api/bonds/:isin/deal-autofill-calc", (req, res) =>
  bondController.getBondDealAutofillCalc(req, res),
);

bondRoute.post("/api/bonds/:isin/deal-autofill-calc", (req, res) =>
  bondController.getBondDealAutofillCalc(req, res),
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

bondRoute.post("/api/bonds/place-order", allowAccessMiddleware("USER"), (req, res) => bondController.placeOrder(req, res));


export default bondRoute;
