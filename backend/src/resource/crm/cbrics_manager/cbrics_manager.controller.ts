import { NseCBRICS } from "@modules/RFQ/nse/nse_CBRICS";
import type { UnregisteredParticipantRequest } from "@modules/RFQ/nse/cbrics.types";
import { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { z } from "zod";
import { CbricsManagerDbService } from "./cbrics_manager.db.service";

const WORKFLOW_RETURNED = new Set<number>([6, 16]);

const workflowStatusSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(5),
  z.literal(6),
  z.literal(10),
  z.literal(15),
  z.literal(16),
  z.literal(100),
]);

const bankAccountsListBodySchema = z.object({
  participantCode: z.string().optional(),
  workflowStatus: workflowStatusSchema,
});

const dpAccountsListBodySchema = z.object({
  participantCode: z.string().optional(),
  /** NSE CBRICS requires this field for /unreg/dpacc/all (cannot be omitted). */
  workflowStatus: workflowStatusSchema,
});

const markDefaultBankSchema = z.object({
  participantCode: z.string(),
  bankIFSC: z.string(),
  bankAccountNo: z.string().optional(),
});

const markDefaultDpSchema = z.object({
  participantCode: z.string(),
  dpType: z.enum(["NSDL", "CDSL"]),
  dpId: z.string().nullish(),
  benId: z.string(),
});

const participantIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const listDbParticipantsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

const groupedCustomersQuerySchema = appSchema.customer.findManyCustomerSchema
  .pick({
    search: true,
    accountStatus: true,
    kycStatus: true,
  })
  .extend({
    maxRows: z.coerce.number().int().min(1).max(5000).default(3000),
  });

/**
 * CRM-only surface to operate NSE CBRICS unregistered-participant APIs.
 * Kept separate from RFQ participant sync flows.
 */
export class CbricsManagerController {
  private nseCbrics = new NseCBRICS();
  private dbService = new CbricsManagerDbService();

  /**
   * Paginated customers who have a linked NSE/CBRICS unregistered participant row in our DB.
   */
  async getCustomersWithCbricsParticipant(req: Request, res: Response) {
    const payload = appSchema.customer.findManyCustomerSchema.parse(req.query);
    const result = await this.dbService.listCustomersWithCbricsParticipant(payload);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  }

  async getCustomersGroupedByParticipantWorkflow(req: Request, res: Response) {
    const q = groupedCustomersQuerySchema.parse(req.query);
    const result = await this.dbService.listCustomersWithCbricsGroupedByWorkflow({
      search: q.search,
      accountStatus: q.accountStatus,
      kycStatus: q.kycStatus,
      maxRows: q.maxRows,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  }

  async getAllDbNseCbricsParticipants(req: Request, res: Response) {
    const q = listDbParticipantsQuerySchema.parse(req.query);
    const result = await this.dbService.listAllNseCbricsParticipants({
      page: q.page,
      pageSize: q.pageSize,
      search: q.search,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  }

  async getCustomerProfileMatchKeys(req: Request, res: Response) {
    const { id } = participantIdParamSchema.parse(req.params);
    const data = await this.dbService.getCustomerProfileMatchKeysForParticipant(id);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async getParticipantById(req: Request, res: Response) {
    const { id } = participantIdParamSchema.parse(req.params);
    const data = await this.nseCbrics.getUnregisteredParticipantById(id);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  /**
   * CRM-only: insert customer profile bank/demat rows that match live CBRICS lines but are missing from CRM (by IFSC+acct / DP keys).
   */
  async postParticipantCreateMissingProfileFinancials(req: Request, res: Response) {
    const { id } = participantIdParamSchema.parse(req.params);
    const live = await this.nseCbrics.getUnregisteredParticipantById(id);
    const result = await this.dbService.createMissingCustomerProfileFinancials(id, live);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  }

  async postBankAccountsList(req: Request, res: Response) {
    const body = bankAccountsListBodySchema.parse(req.body);
    const data = await this.nseCbrics.getAllUnregisteredBankAccounts(body);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async postDpAccountsList(req: Request, res: Response) {
    const body = dpAccountsListBodySchema.parse(req.body);
    const data = await this.nseCbrics.getAllUnregisteredDpAccounts(body);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async postBankMarkDefault(req: Request, res: Response) {
    const body = markDefaultBankSchema.parse(req.body);
    const data = await this.nseCbrics.markDefaultUnregisteredBankAccount(body);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async postDpMarkDefault(req: Request, res: Response) {
    const body = markDefaultDpSchema.parse(req.body);
    const data = await this.nseCbrics.markDefaultUnregisteredDpAccount(body);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  /**
   * POST /unreg/update is only valid per NSE when the participant is in a
   * "returned" workflow state (6 or 16).
   */
  async postParticipantUpdate(req: Request, res: Response) {
    const { id } = participantIdParamSchema.parse(req.params);
    const current = await this.nseCbrics.getUnregisteredParticipantById(id);
    const wf = current.workflowStatus ?? current.actualStatus;
    if (!WORKFLOW_RETURNED.has(wf)) {
      throw new AppError(
        "CBRICS unreg update is only allowed when workflow status is Returned (6) or Returned by Checker (16).",
        { statusCode: HttpStatus.BAD_REQUEST, code: "CBRICS_UNREG_UPDATE_FORBIDDEN" },
      );
    }

    const payload = req.body as Omit<UnregisteredParticipantRequest, "loginId"> & {
      id?: number;
    };
    if (!payload || typeof payload !== "object") {
      throw new AppError("Request body must be a JSON object matching CBRICS unreg update.", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const data = await this.nseCbrics.updateUnregisteredParticipant({
      ...payload,
      id,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }
}
