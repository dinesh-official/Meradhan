import { customerAuthMiddleware } from "@middlewares/customer_middleware";
import { Router } from "express";
import { WatchListController } from "./watchlist.controller";

const watchlistRoutes = Router();
const controller = new WatchListController();

watchlistRoutes.get(
  "/api/watchlist/bonds",
  customerAuthMiddleware,
  controller.getUserBondsWatchList.bind(controller)
);

watchlistRoutes.get(
  "/api/watchlist/bonds/manage",
  customerAuthMiddleware,
  controller.toggleBondsWatchList.bind(controller)
);

watchlistRoutes.get(
  "/api/watchlist/issuer",
  customerAuthMiddleware,
  controller.getUserIssueNotesWatchList.bind(controller)
);

watchlistRoutes.get(
  "/api/watchlist/issuer/manage",
  customerAuthMiddleware,
  controller.toggleIssueNotesWatchList.bind(controller)
);

export default watchlistRoutes;
