import { type Request, type Response } from "express";
import { PortfolioService } from "./portfolio.service";
import { AppError, HttpStatus } from "@utils/error/AppError";

export class PortfolioController {
  private portfolioService = new PortfolioService();

  getTotalInvestedAmount = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const result = await this.portfolioService.getTotalInvestedAmount(customerId);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };
  getAverageMaturity = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const result = await this.portfolioService.getAverageMaturity(customerId);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };

  getAveragePortfolioYield = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const result = await this.portfolioService.getAveragePortfolioYield(customerId);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };

  getInvestmentByBondRating = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const result = await this.portfolioService.getInvestmentByBondRating(
      customerId
    );

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };

  getInvestmentAllocation = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const result = await this.portfolioService.getInvestmentAllocation(
      customerId
    );

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };

  getInvestmentByMaturityBucket = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const result = await this.portfolioService.getInvestmentByMaturityBucket(
      customerId
    );

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };

  getInvestmentByIssuerType = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const result = await this.portfolioService.getInvestmentByIssuerType(
      customerId
    );

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };

  getPortfolioDetails = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const body = req.body ?? {};
    const pageRaw = body.page ?? req.query.page;
    const limitRaw = body.limit ?? req.query.limit;
    const pageNum =
      pageRaw != null && pageRaw !== "" ? Number(pageRaw) : 1;
    const limitNum =
      limitRaw != null && limitRaw !== "" ? Number(limitRaw) : 10;
    const page = Number.isFinite(pageNum) && pageNum >= 1 ? pageNum : 1;
    const limit = Number.isFinite(limitNum) && limitNum >= 1 ? Math.min(limitNum, 100) : 10;
    const {
      bondTypes,
      bondRatings,
      couponRanges,
      paymentFrequencies,
    } = body;

    const result = await this.portfolioService.getPortfolioDetails(
      customerId,
      page,
      limit,
      Array.isArray(bondTypes) ? bondTypes : undefined,
      Array.isArray(bondRatings) ? bondRatings : undefined,
      Array.isArray(couponRanges) ? couponRanges : undefined,
      Array.isArray(paymentFrequencies) ? paymentFrequencies : undefined
    );

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };

  getPortfolioFilters = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const result = await this.portfolioService.getPortfolioFilterOptions(
      customerId
    );

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };
  getPortfolioSummary = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const result = await this.portfolioService.getPortfolioSummary(customerId);

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };
  getCashflowTimeline = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const bondTypes = req.query.bondType
      ? (req.query.bondType as string).split(",").map((t) => t.trim()).filter(Boolean)
      : undefined;
    const isins = req.query.isin
      ? (req.query.isin as string).split(",").map((t) => t.trim()).filter(Boolean)
      : undefined;

    const result = await this.portfolioService.getCashflowTimeline(
      customerId,
      startDate,
      endDate,
      bondTypes,
      isins,
    );

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };
  getCashflowToMaturity = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const result = await this.portfolioService.getCashflowToMaturity(customerId);

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };
}
