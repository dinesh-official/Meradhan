import type { Request, Response } from "express";
import { z } from "zod";
import { HttpStatus } from "@utils/error/AppError";
import { CrmSavedProposalsService } from "./crm_saved_proposals.service";
import { RfqMasterService } from "@resource/crm/refq/nse/rfq_master/rfq_master.service";
import { appSchema } from "@root/schema";
import { AxiosError } from "axios";

export class CrmSavedProposalsController {
  private service = new CrmSavedProposalsService();
  private rfqMasterService = new RfqMasterService();

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
    const schema = z.object({
      customerProfileId: z.number().int().positive(),
      isin: z.string().min(1).max(32),
      bondName: z.string().min(1).max(256),
      side: z.enum(["BUY", "SELL"]),
      quantity: z.number().int().positive(),
      notes: z.string().max(4000).optional().nullable(),
      data: z.unknown(),
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

  autoCreateRfqAndSync = async (req: Request, res: Response) => {
    try {
      const userId = Number(req.session?.id);
      const params = z.object({ id: z.string().min(1) }).parse(req.params);
      const id = Number(params.id);

      const proposal = await this.service.getMyProposalById(userId, id);
      const snapshot = proposal.data as Record<string, unknown> | null;

      const quantity = proposal.quantity;
      const side = proposal.side === "SELL" ? "S" : "B";

      const fetched =
        snapshot && typeof snapshot === "object" && "fetched" in snapshot
          ? (snapshot.fetched as Record<string, unknown> | null)
          : null;

      const bond =
        fetched && typeof fetched === "object" && "bond" in fetched
          ? (fetched.bond as Record<string, unknown> | null)
          : null;

      const dealAutofill =
        fetched && typeof fetched === "object" && "dealAutofill" in fetched
          ? (fetched.dealAutofill as Record<string, unknown> | null)
          : null;

      const suggested =
        dealAutofill && typeof dealAutofill === "object" && "suggested" in dealAutofill
          ? (dealAutofill.suggested as Record<string, unknown> | null)
          : null;

      const pricing =
        fetched && typeof fetched === "object" && "pricing" in fetched
          ? (fetched.pricing as Record<string, unknown> | null)
          : null;

      const faceValueRaw =
        (pricing?.faceValue as unknown) ??
        (suggested?.faceValue as unknown) ??
        (bond?.faceValue as unknown);
      const faceValue = Number(faceValueRaw);
      const quantum = Number.isFinite(faceValue) ? faceValue * quantity : NaN;
      const valueCrores = Number.isFinite(quantum) && quantum > 0 ? quantum / 10_000_000 : NaN;

      const yieldRaw =
        (dealAutofill?.pricing as Record<string, unknown> | null)?.finalYieldRaw ??
        (suggested?.buyYield as unknown) ??
        (bond?.buyYield as unknown);
      const yieldValue = Number(yieldRaw);

      // Mirror UI defaults as closely as possible.
      const rfqPayload = appSchema.rfq.addIsinSchema.parse({
        segment: "R",
        isin: proposal.isin,
        participantCode: "BCISPL",
        dealType: "D",
        clientCode: "BCISPL",
        institutions: false,
        buySell: side,
        quoteType: "Y",
        settlementType: "0",
        value: Number.isFinite(valueCrores) && valueCrores > 0 ? valueCrores : 1,
        quantity,
        yieldType: "YTM",
        yield: Number.isFinite(yieldValue) ? Math.max(0, yieldValue) : 0,
        calcMethod: "O",
        access: "2",
        gtdFlag: "Y",
        quoteNegotiable: "Y",
        valueNegotiable: "Y",
      });

      const created = await this.rfqMasterService.createNewRfq(rfqPayload, userId);

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: {
          rfq: created?.[0] ?? created,
          redirectTo: "/dashboard/rfqs/nse/deals",
        },
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

