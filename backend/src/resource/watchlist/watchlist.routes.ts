import { Router } from "express";
import { WatchListController } from "./watchlist.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const watchlistRoutes = Router();
const controller = new WatchListController();

watchlistRoutes.get(
  "/api/watchlist/bonds",
  allowAccessMiddleware("USER"),
  controller.getUserBondsWatchList.bind(controller)
);

watchlistRoutes.get(
  "/api/watchlist/bonds/manage",
  allowAccessMiddleware("USER"),
  controller.toggleBondsWatchList.bind(controller)
);

watchlistRoutes.get(
  "/api/watchlist/issuer",
  allowAccessMiddleware("USER"),
  controller.getUserIssueNotesWatchList.bind(controller)
);

watchlistRoutes.get(
  "/api/watchlist/issuer/manage",
  allowAccessMiddleware("USER"),
  controller.toggleIssueNotesWatchList.bind(controller)
);

export default watchlistRoutes;
