import type { Request, Response } from "express";
import { WatchListService } from "./watchlist.service";
import { AppError } from "@utils/error/AppError";

export class WatchListController {
  private service = new WatchListService();
  async getUserBondsWatchList(req: Request, res: Response) {
    const data = await this.service.getUserBondsWatchList(req.customer!.id);
    res.send(data || []);
  }

  async toggleBondsWatchList(req: Request, res: Response) {
    if (!req.query.isin) {
      throw new AppError("Enter isin as required.");
    }
    const data = await this.service.toggleBondsWatchList(
      req.customer!.id,
      req.query.isin.toString()
    );
    res.send({
      status: data,
    });
  }

  async getUserIssueNotesWatchList(req: Request, res: Response) {
    const data = await this.service.getUserIssueNotesWatchList(
      req.customer!.id
    );
    res.send(data || []);
  }

  async toggleIssueNotesWatchList(req: Request, res: Response) {
    if (!req.query.issuerId) {
      throw new AppError("Enter issuerId as required.");
    }
    const data = await this.service.toggleIssueNotesWatchList(
      req.customer!.id,
      req.query.issuerId.toString()
    );
    res.send({
      status: data,
    });
  }
}
