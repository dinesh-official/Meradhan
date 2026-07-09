import type { Request, Response } from "express";
import { z } from "zod";
import { HttpStatus } from "@utils/error/AppError";
import {
  RazorpayRouteSettlementAccountsService,
  type CreateSettlementAccountInput,
} from "./razorpay_route_settlement_accounts.service";

export class RazorpayRouteSettlementAccountsController {
  private service = new RazorpayRouteSettlementAccountsService();

  listByAccount = async (req: Request, res: Response) => {
    const paramsSchema = z.object({ id: z.string().min(1) });
    const { id } = paramsSchema.parse(req.params);

    const records = await this.service.listByRazorpayAccount(id);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { records },
    });
  };

  createForAccount = async (req: Request, res: Response) => {
    const paramsSchema = z.object({ id: z.string().min(1) });
    const { id } = paramsSchema.parse(req.params);

    const bodySchema = z.object({
      accountNumber: z.string().min(6).max(30),
      ifscCode: z.string().min(6).max(20),
      beneficiaryName: z.string().min(2).max(200),
      isDefault: z.boolean().optional(),
    });
    const body = bodySchema.parse(req.body);

    const created = await this.service.create({
      razorpayAccountId: id,
      ...body,
    } as CreateSettlementAccountInput);

    return res.sendResponse({
      statusCode: HttpStatus.CREATED,
      responseData: { record: created },
    });
  };

  updateForAccount = async (req: Request, res: Response) => {
    const paramsSchema = z.object({
      id: z.string().min(1),
      settlementId: z.string().regex(/^\d+$/),
    });
    const { id, settlementId } = paramsSchema.parse(req.params);

    const bodySchema = z.object({
      accountNumber: z.string().min(6).max(30).optional(),
      ifscCode: z.string().min(6).max(20).optional(),
      beneficiaryName: z.string().min(2).max(200).optional(),
      isDefault: z.boolean().optional(),
    });
    const payload = bodySchema.parse(req.body);

    const updated = await this.service.update(Number(settlementId), id, payload);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { record: updated },
    });
  };

  deleteForAccount = async (req: Request, res: Response) => {
    const paramsSchema = z.object({
      id: z.string().min(1),
      settlementId: z.string().regex(/^\d+$/),
    });
    const { id, settlementId } = paramsSchema.parse(req.params);

    await this.service.delete(Number(settlementId), id);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { success: true },
    });
  };
}

