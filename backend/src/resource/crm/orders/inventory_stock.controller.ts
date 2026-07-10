import type { Request, Response } from "express";
import { HttpStatus } from "@utils/error/AppError";
import { CrmInventoryStockService } from "./inventory_stock.service";

export class CrmInventoryStockController {
  private service = new CrmInventoryStockService();

  upload = async (req: Request, res: Response) => {
    try {
      const file = req.file as Express.Multer.File | undefined;
      if (!file?.buffer?.length) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: "Missing file",
        });
      }

      const session = req.session as { id?: number; email?: string } | undefined;
      const result = await this.service.uploadFromBuffer({
        buffer: file.buffer,
        originalFileName: file.originalname || "upload",
        uploadedByUserId: typeof session?.id === "number" ? session.id : undefined,
        uploadedByEmail: typeof session?.email === "string" ? session.email : undefined,
      });

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Inventory batch saved",
        responseData: result,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Upload failed";
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message,
      });
    }
  };

  /** Demat PDF — step 1: parse + compute adjustments, no DB write. */
  previewDematPdf = async (req: Request, res: Response) => {
    try {
      const file = req.file as Express.Multer.File | undefined;
      if (!file?.buffer?.length) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: "Missing file",
        });
      }

      const result = await this.service.previewDematPdf({ buffer: file.buffer });

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Preview generated",
        responseData: result,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Preview failed";
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message,
      });
    }
  };

  /** Demat PDF — step 2: re-parse + re-derive, then write the corrected batch. */
  commitDematPdf = async (req: Request, res: Response) => {
    try {
      const file = req.file as Express.Multer.File | undefined;
      if (!file?.buffer?.length) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: "Missing file",
        });
      }

      const session = req.session as { id?: number; email?: string } | undefined;
      const result = await this.service.commitDematPdf({
        buffer: file.buffer,
        originalFileName: file.originalname || "demat-statement.pdf",
        uploadedByUserId: typeof session?.id === "number" ? session.id : undefined,
        uploadedByEmail: typeof session?.email === "string" ? session.email : undefined,
      });

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Inventory updated from Demat statement",
        responseData: result,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Commit failed";
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message,
      });
    }
  };

  listDays = async (_req: Request, res: Response) => {
    const days = await this.service.listDays();
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { days },
    });
  };

  listBatches = async (req: Request, res: Response) => {
    try {
      const dayKey = req.query.dayKey?.toString();
      if (!dayKey) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: "Query dayKey (YYYY-MM-DD) is required",
        });
      }
      const batches = await this.service.listBatchesForDay(dayKey);
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: { batches },
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Invalid request";
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message,
      });
    }
  };

  latestSummary = async (_req: Request, res: Response) => {
    const batch = await this.service.getLatestBatchSummary();
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { batch },
    });
  };

  batchLines = async (req: Request, res: Response) => {
    const batchId = Number(req.params.batchId);
    if (!batchId || Number.isNaN(batchId)) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Invalid batch id",
      });
    }
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const search = req.query.search?.toString();

    const data = await this.service.getBatchLines({
      batchId,
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : 50,
      search,
    });

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  };

  updateLineQuantity = async (req: Request, res: Response) => {
    try {
      const lineId = Number(req.params.lineId);
      if (!lineId || Number.isNaN(lineId)) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: "Invalid line id",
        });
      }

      const body = req.body as Record<string, unknown>;
      const quantity =
        body.quantity === undefined || body.quantity === null
          ? undefined
          : Number(body.quantity);
      const delta =
        body.delta === undefined || body.delta === null ? undefined : Number(body.delta);

      const updated = await this.service.updateLineQuantity({
        lineId,
        quantity,
        delta,
      });

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Quantity updated",
        responseData: { line: updated },
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Update failed";
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message,
      });
    }
  };

  deleteBatch = async (req: Request, res: Response) => {
    try {
      const batchId = Number(req.params.batchId);
      if (!batchId || Number.isNaN(batchId)) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: "Invalid batch id",
        });
      }
      await this.service.deleteBatch(batchId);
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Batch deleted",
        responseData: { deletedId: batchId },
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Delete failed";
      const notFound = message.includes("not found");
      return res.sendResponse({
        statusCode: notFound ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST,
        success: false,
        message,
      });
    }
  };
}
