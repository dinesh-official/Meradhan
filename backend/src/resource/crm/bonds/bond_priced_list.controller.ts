import type { Request, Response } from "express";
import { HttpStatus } from "@utils/error/AppError";
import { BondPricedListService } from "./bond_priced_list.service";

export class BondPricedListController {
  private service = new BondPricedListService();

  async uploadConsolidated(req: Request, res: Response) {
    const file = (req as unknown as { file?: Express.Multer.File }).file;
    if (!file?.path) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Missing file",
      });
    }

    const result = await this.service.bulkUploadConsolidatedCsv(file.path);

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Upload processed",
      responseData: result,
    });
  }

  async listConsolidated(req: Request, res: Response) {
    const search = req.query.search?.toString();
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 25;
    const pricingDate = req.query.pricingDate?.toString();
    const sortRaw = req.query.sortOrder?.toString().toLowerCase();
    const sortOrder = sortRaw === "asc" ? "asc" : "desc";

    const data = await this.service.listConsolidated({
      search,
      page,
      limit,
      pricingDate,
      sortOrder,
    });

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async upsertConsolidatedRow(req: Request, res: Response) {
    const row = req.body;
    if (!row || typeof row !== "object") {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Missing row payload",
      });
    }

    const result = await this.service.upsertConsolidatedRow(row);

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Row processed",
      responseData: result,
    });
  }
}

