import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";

export class DashboardController {
  private service = new DashboardService();

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
}

