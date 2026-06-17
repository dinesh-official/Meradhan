import type { Request, Response } from "express";
import { z } from "zod";
import { HttpStatus } from "@utils/error/AppError";
import { CrmSavedProposalsService } from "./crm_saved_proposals.service";
import { AxiosError } from "axios";

export class CrmSavedProposalsController {
  private service = new CrmSavedProposalsService();

  listAll = async (_req: Request, res: Response) => {
    const rows = await this.service.listAllProposals();
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { proposals: rows },
    });
  };

  listMine = async (req: Request, res: Response) => {
    const userId = Number(req.session?.id);
    const rows = await this.service.listMyProposals(userId);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { proposals: rows },
    });
  };

  create = async (req: Request, res: Response) => {
    const userId = Number(req.session?.id);
    const schema = z
      .object({
        customerProfileId: z.number().int().positive().optional().nullable(),
        linkedRfqParticipantCode: z.string().min(1).max(64).optional().nullable(),
        isin: z.string().min(1).max(32),
        bondName: z.string().min(1).max(256),
        side: z.enum(["BUY", "SELL"]),
        quantity: z.number().int().positive(),
        notes: z.string().max(4000).optional().nullable(),
        data: z.unknown(),
      })
      .superRefine((body, ctx) => {
        const hasCustomer = body.customerProfileId != null;
        const hasParticipant = Boolean(body.linkedRfqParticipantCode?.trim());
        if (hasCustomer === hasParticipant) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Provide exactly one of customerProfileId or linkedRfqParticipantCode",
            path: ["customerProfileId"],
          });
        }
      });
    const body = schema.parse(req.body);
    const row = await this.service.createProposal(userId, body);
    return res.sendResponse({
      statusCode: HttpStatus.CREATED,
      responseData: { proposal: row },
    });
  };

  getById = async (req: Request, res: Response) => {
    const userId = Number(req.session?.id);
    const params = z.object({ id: z.string().min(1) }).parse(req.params);
    const id = Number(params.id);
    const row = await this.service.getMyProposalById(userId, id);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { proposal: row },
    });
  };

  deleteById = async (req: Request, res: Response) => {
    const userId = Number(req.session?.id);
    const params = z.object({ id: z.string().min(1) }).parse(req.params);
    const id = Number(params.id);
    await this.service.deleteMyProposal(userId, id);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { success: true },
    });
  };

  queueProcessing = async (req: Request, res: Response) => {
    const params = z.object({ id: z.string().min(1) }).parse(req.params);
    const result = await this.service.queueProcessing(Number(params.id));
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };

  markWaitingForApproval = async (req: Request, res: Response) => {
    const params = z.object({ id: z.string().min(1) }).parse(req.params);
    const result = await this.service.markWaitingForApproval(Number(params.id));
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };

  autoCreateRfqAndSync = async (req: Request, res: Response) => {
    try {
      const userId = Number(req.session?.id);
      const params = z.object({ id: z.string().min(1) }).parse(req.params);
      const id = Number(params.id);

      const result = await this.service.createIsinRfqFromProposal(userId, id);

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: result,
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        const data = error.response?.data as unknown;
        const errorMessage =
          (typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : undefined) ||
          (typeof data === "object" &&
            data !== null &&
            "messages" in data &&
            typeof (data as { messages?: unknown }).messages === "string"
            ? (data as { messages: string }).messages
            : undefined) ||
          (typeof data === "string" ? data : undefined) ||
          error.message ||
          "RFQ creation failed";
        return res.sendResponse({
          statusCode: error.response?.status || HttpStatus.BAD_REQUEST,
          success: false,
          message: typeof errorMessage === "string" ? errorMessage : "RFQ creation failed",
          responseData: typeof data === "string" ? [data] : data,
        });
      }
      const msg = error instanceof Error ? error.message : "RFQ creation failed";
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: msg,
      });
    }
  };
}

