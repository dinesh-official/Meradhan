import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { SettlementJobOverviewService } from "@services/order/settlement_job_overview.service";

export class DashboardController {
  private service = new DashboardService();
  private settlementJobService = new SettlementJobOverviewService();

  getSummary = async (req: Request, res: Response) => {
    const rangeDays = Number(req.query.rangeDays) || 30;
    const summary = await this.service.getSummary(rangeDays);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: summary,
    });
  };

  getSalesPerformance = async (req: Request, res: Response) => {
    const rangeDays = Number(req.query.rangeDays) || 30;
    const summary = await this.service.getSalesPerformance(rangeDays);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: summary,
    });
  };

  getSettlementJobStatus = async (_req: Request, res: Response) => {
    const overview = await this.settlementJobService.getOverview();
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: overview,
    });
  };

  runSettlementReconciliation = async (_req: Request, res: Response) => {
    const result = await this.settlementJobService.runReconciliation();
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Stage reconciliation batch completed.",
      responseData: result,
    });
  };

  rerunLastSettlementJob = async (_req: Request, res: Response) => {
    const result = await this.settlementJobService.rerunLastJob();
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: result.message,
      responseData: result,
    });
  };
}

