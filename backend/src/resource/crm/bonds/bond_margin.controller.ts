import type { Request, Response } from "express";
import { HttpStatus } from "@utils/error/AppError";
import { BondMarginService } from "./bond_margin.service";

export class BondMarginController {
  private service = new BondMarginService();

  async list(req: Request, res: Response) {
    const search = req.query.search?.toString();
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 25;
    const data = await this.service.list({ search, page, limit });
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async create(req: Request, res: Response) {
    const created = await this.service.create(req.body as Record<string, unknown>);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Margin created",
      responseData: created,
    });
  }

  async update(req: Request, res: Response) {
    const id = req.params.id?.toString() ?? "";
    if (!id) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Missing id",
      });
    }
    const updated = await this.service.update(id, req.body as Record<string, unknown>);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Margin updated",
      responseData: updated,
    });
  }

  async remove(req: Request, res: Response) {
    const id = req.params.id?.toString() ?? "";
    if (!id) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Missing id",
      });
    }
    await this.service.remove(id);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Margin deleted",
      responseData: { success: true },
    });
  }
}

