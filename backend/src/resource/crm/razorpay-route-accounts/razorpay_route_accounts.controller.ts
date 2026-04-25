import type { Request, Response } from "express";
import { AppError, HttpStatus } from "@utils/error/AppError";
import {
  RazorpayRouteAccountsService,
  type CreateRazorpayLinkedAccountInput,
} from "./razorpay_route_accounts.service";
import { z } from "zod";

export class RazorpayRouteAccountsController {
  private service = new RazorpayRouteAccountsService();

  getAllAccounts = async (_req: Request, res: Response) => {
    const accounts = await this.service.getAll();
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { accounts },
    });
  };

  getAccountById = async (req: Request, res: Response) => {
    const schema = z.object({
      id: z.string().min(1),
    });
    const params = schema.parse(req.params);

    const account = await this.service.getByRazorpayAccountId(params.id);
    if (!account) {
      throw new AppError("Account not found", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "RAZORPAY_ROUTE_ACCOUNT_NOT_FOUND",
      });
    }

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { account },
    });
  };

  createLinkedAccount = async (req: Request, res: Response) => {
    const schema = z.object({
      email: z.string().email(),
      phone: z.string().min(8).max(15),
      reference_id: z.string().min(1).max(512).optional(),
      legal_business_name: z.string().min(4).max(200),
      business_type: z.string().min(1),
      contact_name: z.string().min(2).max(255),
      isDefault: z.boolean().optional(),
      profile: z.object({
        category: z.string().min(1),
        subcategory: z.string().min(1),
        addresses: z.object({
          registered: z.object({
            street1: z.string().max(250).optional(),
            street2: z.string().max(250).optional(),
            city: z.string().max(250).optional(),
            state: z.string().min(2).max(250).optional(),
            postal_code: z.string().min(1).optional(),
            country: z.string().min(2).max(250).optional(),
          }),
        }),
      }),
      legal_info: z.object({
        pan: z.string().optional(),
        gst: z.string().optional(),
      }),
    });

    const body = schema.parse(req.body) as CreateRazorpayLinkedAccountInput;
    const result = await this.service.createLinkedAccount(body);

    return res.sendResponse({
      statusCode: HttpStatus.CREATED,
      responseData: {
        account: result.razorpay,
        record: result.record,
      },
    });
  };

  updateLinkedAccount = async (req: Request, res: Response) => {
    const paramsSchema = z.object({ id: z.string().min(1) });
    const { id } = paramsSchema.parse(req.params);

    const bodySchema = z.object({
      legal_business_name: z.string().min(4).max(200),
      contact_name: z.string().min(2).max(255),
      isDefault: z.boolean().optional(),
      profile: z.object({
        category: z.string().min(1),
        subcategory: z.string().min(1),
        addresses: z.object({
          registered: z.object({
            street1: z.string().max(100).optional(),
            street2: z.string().max(100).optional(),
            city: z.string().max(100).optional(),
            state: z.string().min(2).max(32).optional(),
            postal_code: z.string().length(6).optional(),
            country: z.string().min(2).max(64).optional(),
          }),
        }),
      }),
      legal_info: z.object({
        pan: z.string().optional(),
        gst: z.string().optional(),
      }),
    });

    const payload = bodySchema.parse(req.body);
    const result = await this.service.updateLinkedAccount(id, payload);

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        account: result.razorpay,
        record: result.record,
      },
    });
  };
}

