import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import type { ParticipantRecord } from "@modules/RFQ/nse/cbrics.types";
import { CbricsKraResyncService } from "./cbrics.kra_resync.service";
import { CbricsParticipantService } from "./cbrics.service";
import { NseRfqParticipantInfoService } from "./rfqParticipantInfo.service";
import { NseCBRICS } from "@modules/RFQ/nse/nse_CBRICS";

const workflowLabelLookup = Object.fromEntries(
  appSchema.crm.rfq.nse.getParticipants.CBRICS_UNREG_WORKFLOW_STATUS_OPTIONS.map(
    (row) => [row.code, row.label] as const
  )
);

export class CbricsParticipantController {
  private participantService = new CbricsParticipantService();
  private nseCbrics = new NseCBRICS();
  private cbricsKraResync = new CbricsKraResyncService();
  private rfqParticipantInfo = new NseRfqParticipantInfoService();

  async handleGetParticipants(req: Request, res: Response) {
    // safeParse gives you non-throwing validation
    const result = appSchema.crm.rfq.nse.getParticipants.GetParticipantsZ.parse(
      req.query
    );
    console.log(result);

    const data = await this.participantService.getParticipants(result);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async handleGetParticipantsCbrics(req: Request, res: Response) {
    // safeParse gives you non-throwing validation
    const result = appSchema.crm.rfq.nse.getParticipants.GetParticipantsZ.parse(
      req.query
    );
    console.log(result);

    const data = await this.nseCbrics.getAllUnregisteredParticipants({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      workflowStatus: result.workflowStatus as any,
      firstName: result.search,
      loginId: result.statusCode,
    });
    console.log(data);

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  /** Catalog of `/unreg/all` workflow codes and labels — for CRM filters. */
  async handleGetCbricsWorkflowStatuses(_req: Request, res: Response) {
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData:
        appSchema.crm.rfq.nse.getParticipants.CBRICS_UNREG_WORKFLOW_STATUS_OPTIONS,
    });
  }

  /**
   * Live NSE `/unreg/all` for exactly one workflow code (separate URL per status).
   * Example: GET .../workflow/16 → status 16 only.
   */
  async handleGetParticipantsCbricsByWorkflow(req: Request, res: Response) {
    const { workflowStatus } =
      appSchema.crm.rfq.nse.getParticipants.CbricsWorkflowStatusPathParamsZ.parse(
        req.params
      );
    const query = appSchema.crm.rfq.nse.getParticipants.CbricsUnregAllQueryZ.parse(
      req.query
    );

    const searchTrimmed = query.search?.trim();

    const data = await this.nseCbrics.getAllUnregisteredParticipants({
      workflowStatus,
      ...(searchTrimmed ? { firstName: searchTrimmed } : {}),
      ...(query.loginId?.trim() ? { loginId: query.loginId.trim() } : {}),
      ...(query.panNo?.trim() ? { panNo: query.panNo.trim() } : {}),
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        workflowStatus,
        workflowLabel: workflowLabelLookup[workflowStatus] ?? `Workflow ${workflowStatus}`,
        participants: data,
      },
    });
  }

  /**
   * CRM: resync `customerProfile.kraStatus` from selected CBRICS participants
   * (`loginId` → `userName`, KYC must be VERIFIED). Separate from webhooks.
   */
  handleResyncKraFromCbricsParticipants = async (req: Request, res: Response) => {
    const parsed =
      appSchema.crm.rfq.nse.getParticipants.ResyncKraFromCbricsParticipantsBodyZ.safeParse(
        req.body,
      );
    if (!parsed.success) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Invalid request body",
        responseData: parsed.error.flatten(),
      });
    }

    const data = await this.cbricsKraResync.resyncFromParticipantItems(
      parsed.data,
    );

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  };

  async handleGetParticipantsRfq(req: Request, res: Response) {
    const query =
      appSchema.crm.rfq.nse.getParticipants.RfqParticipantsListQueryZ.parse(
        req.query,
      );

    const participants = await this.nseCbrics.findParticipants({
      type: 2,
      ...(query.loginId?.trim() ? { loginId: query.loginId.trim() } : {}),
      ...(query.panNo?.trim() ? { panNo: query.panNo.trim() } : {}),
    });

    const data = participants.map((p: ParticipantRecord) => ({
      code: p.loginId,
      name: p.firstName,
      panNo: p.panNo ?? null,
      custodian: p.custodian ?? null,
      actualStatus: p.actualStatus,
      type: p.type,
    }));

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async handleListSavedRfqParticipantInfoCodes(_req: Request, res: Response) {
    const codes = await this.rfqParticipantInfo.listSavedCodes();
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { codes },
    });
  }

  async handleListRfqParticipantInfoSummaries(
    _req: Request,
    res: Response,
  ) {
    const summaries = await this.rfqParticipantInfo.listAllInfoSummary();
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { summaries },
    });
  }

  async handleGetRfqParticipantInfo(req: Request, res: Response) {
    const { code } =
      appSchema.crm.rfq.nse.rfqParticipantInfo.NseRfqParticipantCodeParamZ.parse(
        req.params,
      );

    const data = await this.rfqParticipantInfo.findByCode(code);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async handleUpsertRfqParticipantInfo(req: Request, res: Response) {
    const { code } =
      appSchema.crm.rfq.nse.rfqParticipantInfo.NseRfqParticipantCodeParamZ.parse(
        req.params,
      );

    const parsed =
      appSchema.crm.rfq.nse.rfqParticipantInfo.NseRfqParticipantInfoUpsertBodyZ.safeParse(
        req.body,
      );
    if (!parsed.success) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid participant info payload.",
        responseData: parsed.error.flatten(),
      });
    }

    const data = await this.rfqParticipantInfo.upsertByCode(code, parsed.data);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }
}
