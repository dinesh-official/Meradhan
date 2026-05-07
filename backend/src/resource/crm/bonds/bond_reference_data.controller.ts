import type { Request, Response } from "express";
import { HttpStatus } from "@utils/error/AppError";
import { BondReferenceDataService } from "./bond_reference_data.service";

export class BondReferenceDataController {
  private service = new BondReferenceDataService();

  async upsertByIsin(req: Request, res: Response) {
    const payload = req.body;
    if (!payload || typeof payload !== "object") {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Missing payload",
      });
    }

    console.log(payload);


    const result = await this.service.upsertReferenceByIsin(payload as any);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "ISIN processed",
      responseData: result,
    });
  }

  async list(req: Request, res: Response) {
    const search = req.query.search?.toString();
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 25;

    const data = await this.service.listReferenceMetadata({ search, page, limit });
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async schedules(req: Request, res: Response) {
    const isin = req.params.isin?.toString() ?? "";
    const data = await this.service.getSchedulesByIsin(isin);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }
}

