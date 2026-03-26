import { Router } from "express";
import { PortfolioController } from "./portfolio.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const portfolioRoutes = Router();
const portfolioController = new PortfolioController();

portfolioRoutes.get(
  "/api/customer/portfolio/total-invested",
  allowAccessMiddleware("USER"),
  portfolioController.getTotalInvestedAmount
);
portfolioRoutes.get(
  "/api/customer/portfolio/average-maturity",
  allowAccessMiddleware("USER"),
  portfolioController.getAverageMaturity
);
portfolioRoutes.get(
  "/api/customer/portfolio/average-yield",
  allowAccessMiddleware("USER"),
  portfolioController.getAveragePortfolioYield
);
portfolioRoutes.get(
  "/api/customer/portfolio/investment-by-rating",
  allowAccessMiddleware("USER"),
  portfolioController.getInvestmentByBondRating
);
portfolioRoutes.get(
  "/api/customer/portfolio/investment-allocation",
  allowAccessMiddleware("USER"),
  portfolioController.getInvestmentAllocation
);
portfolioRoutes.get(
  "/api/customer/portfolio/investment-by-maturity",
  allowAccessMiddleware("USER"),
  portfolioController.getInvestmentByMaturityBucket
);
portfolioRoutes.get(
  "/api/customer/portfolio/investment-by-issuer-type",
  allowAccessMiddleware("USER"),
  portfolioController.getInvestmentByIssuerType
);
portfolioRoutes.get(
  "/api/customer/portfolio/details",
  allowAccessMiddleware("USER"),
  portfolioController.getPortfolioDetails
);
portfolioRoutes.post(
  "/api/customer/portfolio/details",
  allowAccessMiddleware("USER"),
  portfolioController.getPortfolioDetails
);
portfolioRoutes.get(
  "/api/customer/portfolio/details/filters",
  allowAccessMiddleware("USER"),
  portfolioController.getPortfolioFilters
);
portfolioRoutes.get(
  "/api/customer/portfolio/summary",
  allowAccessMiddleware("USER"),
  portfolioController.getPortfolioSummary
);
portfolioRoutes.get(
  "/api/customer/portfolio/cashflow-timeline",
  allowAccessMiddleware("USER"),
  portfolioController.getCashflowTimeline
);
portfolioRoutes.get(
  "/api/customer/portfolio/cashflow-maturity",
  allowAccessMiddleware("USER"),
  portfolioController.getCashflowToMaturity
);
export default portfolioRoutes;
