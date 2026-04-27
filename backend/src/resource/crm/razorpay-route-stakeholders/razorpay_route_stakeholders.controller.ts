import type { Request, Response } from "express";
import { HttpStatus } from "@utils/error/AppError";
import { z } from "zod";
import {
  RazorpayRouteStakeholdersService,
  type CreateRazorpayStakeholderInput,
} from "./razorpay_route_stakeholders.service";

export class RazorpayRouteStakeholdersController {
  private service = new RazorpayRouteStakeholdersService();

  listByAccount = async (req: Request, res: Response) => {
    const paramsSchema = z.object({ id: z.string().min(1) });
    const { id } = paramsSchema.parse(req.params);

    const stakeholders = await this.service.listByAccount(id);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { stakeholders },
    });
  };

  createForAccount = async (req: Request, res: Response) => {
    const paramsSchema = z.object({ id: z.string().min(1) });
    const { id } = paramsSchema.parse(req.params);

    const bodySchema = z.object({
      name: z.string().min(2).max(255),
      email: z.string().email(),
      userId: z.number().int().positive().optional(),
      addresses: z.object({
        residential: z.object({
          street: z.string().min(1).max(200),
          city: z.string().min(1).max(100),
          state: z.string().min(1).max(100),
          postal_code: z.string().min(4).max(10),
          country: z.string().min(2).max(64),
        }),
      }),
      kyc: z.object({
        pan: z.string().min(10).max(10),
      }),
      notes: z.record(z.string(), z.string()).optional(),
    });

    const input = bodySchema.parse(req.body) as CreateRazorpayStakeholderInput;
    const result = await this.service.createStakeholder(id, input);

    return res.sendResponse({
      statusCode: HttpStatus.CREATED,
      responseData: {
        stakeholder: result.razorpay,
        record: result.record,
      },
    });
  };

  updateForAccount = async (req: Request, res: Response) => {
    const paramsSchema = z.object({
      id: z.string().min(1),
      stakeholderId: z.string().min(1),
    });
    const { id, stakeholderId } = paramsSchema.parse(req.params);

    const bodySchema = z.object({
      userId: z.number().int().positive().optional(),
      addresses: z.object({
        residential: z.object({
          street: z.string().min(1).max(200),
          city: z.string().min(1).max(100),
          state: z.string().min(1).max(100),
          postal_code: z.string().min(4).max(10),
          country: z.string().min(2).max(64),
        }),
      }),
      kyc: z.object({
        pan: z.string().min(10).max(10),
      }),
    });

    const payload = bodySchema.parse(req.body);
    const result = await this.service.updateStakeholder(id, stakeholderId, payload);

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        stakeholder: result.razorpay,
        record: result.record,
      },
    });
  };
}

