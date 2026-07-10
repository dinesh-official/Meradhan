import type { Request, Response } from "express";
import { z } from "zod";
import { HttpStatus } from "@utils/error/AppError";
import { BondDocumentsService } from "./bond_documents.service";

export class BondDocumentsController {
  private service = new BondDocumentsService();

  list = async (req: Request, res: Response) => {
    const isin = req.params.isin?.trim() ?? "";
    if (!isin) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Missing ISIN",
      });
    }

    const documents = await this.service.list(isin);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { documents },
    });
  };

  create = async (req: Request, res: Response) => {
    const isin = req.params.isin?.trim() ?? "";
    if (!isin) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Missing ISIN",
      });
    }

    const body = z
      .object({
        name: z.string().trim().min(1, "Document name is required").max(256),
        fileUrl: z.string().trim().min(1, "File URL is required"),
        fileName: z.string().trim().max(512).optional().nullable(),
      })
      .parse(req.body);

    const createdByCrmUserId =
      typeof (req.session as { id?: unknown } | undefined)?.id === "number"
        ? (req.session as { id: number }).id
        : undefined;

    const created = await this.service.create(isin, {
      ...body,
      createdByCrmUserId,
    });

    return res.sendResponse({
      statusCode: HttpStatus.CREATED,
      message: "Document saved",
      responseData: { document: created },
    });
  };

  update = async (req: Request, res: Response) => {
    const isin = req.params.isin?.trim() ?? "";
    const id = Number(req.params.id);
    if (!isin || !Number.isFinite(id)) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Invalid ISIN or document id",
      });
    }

    const body = z
      .object({
        name: z.string().trim().min(1).max(256).optional(),
        fileUrl: z.string().trim().min(1).optional(),
        fileName: z.string().trim().max(512).optional().nullable(),
      })
      .refine((v) => v.name != null || v.fileUrl != null || v.fileName !== undefined, {
        message: "Provide at least one field to update",
      })
      .parse(req.body);

    const updated = await this.service.update(isin, id, body);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Document updated",
      responseData: { document: updated },
    });
  };

  remove = async (req: Request, res: Response) => {
    const isin = req.params.isin?.trim() ?? "";
    const id = Number(req.params.id);
    if (!isin || !Number.isFinite(id)) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Invalid ISIN or document id",
      });
    }

    await this.service.remove(isin, id);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Document deleted",
      responseData: { success: true },
    });
  };
}
