import { AppError, HttpStatus } from "@utils/error/AppError";
import { CrmSavedProposalsRepo } from "./crm_saved_proposals.repo";
import { db } from "@core/database/database";
import { RfqMasterService } from "@resource/crm/refq/nse/rfq_master/rfq_master.service";
import {
  buildAddIsinPayloadFromProposal,
  rfqManageRedirectFromCreateResult,
} from "./proposal_rfq_payload.util";

export class CrmSavedProposalsService {
  private rfqMasterService = new RfqMasterService();
  async createProposal(createdById: number, input: {
    customerProfileId?: number | null;
    linkedRfqParticipantCode?: string | null;
    isin: string;
    bondName: string;
    side: "BUY" | "SELL";
    quantity: number;
    notes?: string | null;
    data: unknown;
  }) {
    if (!createdById || Number.isNaN(createdById)) {
      throw new AppError("Unauthorized", {
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const customerProfileId = input.customerProfileId ?? null;
    const linkedRfqParticipantCode =
      input.linkedRfqParticipantCode?.trim() || null;

    if (customerProfileId == null && !linkedRfqParticipantCode) {
      throw new AppError(
        "Either customerProfileId or linkedRfqParticipantCode is required",
        { statusCode: HttpStatus.BAD_REQUEST },
      );
    }
    if (customerProfileId != null && linkedRfqParticipantCode) {
      throw new AppError(
        "Provide either customerProfileId or linkedRfqParticipantCode, not both",
        { statusCode: HttpStatus.BAD_REQUEST },
      );
    }

    if (linkedRfqParticipantCode) {
      const participantInfo =
        await db.dataBase.nseRfqParticipantInfoModel.findUnique({
          where: { code: linkedRfqParticipantCode },
        });
      if (!participantInfo) {
        throw new AppError(
          `RFQ participant info not found for code "${linkedRfqParticipantCode}". Add an entry via RFQ Participants first.`,
          { statusCode: HttpStatus.BAD_REQUEST },
        );
      }
    }

    return CrmSavedProposalsRepo.create({
      createdById,
      customerProfileId,
      linkedRfqParticipantCode,
      isin: input.isin,
      bondName: input.bondName,
      side: input.side,
      quantity: input.quantity,
      notes: input.notes ?? null,
      data: input.data,
    });
  }

  async listMyProposals(createdById: number) {
    if (!createdById || Number.isNaN(createdById)) {
      throw new AppError("Unauthorized", {
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }
    return CrmSavedProposalsRepo.listByCreatedBy(createdById);
  }

  async listAllProposals() {
    return CrmSavedProposalsRepo.listAll();
  }

  async getMyProposalById(createdById: number, id: number) {
    const row = await CrmSavedProposalsRepo.findById(id, createdById);
    if (!row) {
      throw new AppError("Proposal not found", {
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return row;
  }

  async deleteMyProposal(createdById: number, id: number) {
    const res = await CrmSavedProposalsRepo.deleteById(id, createdById);
    if (res.count === 0) {
      throw new AppError("Proposal not found", {
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return { success: true };
  }

  async queueProcessing(id: number) {
    const proposal = await db.dataBase.crmSavedProposal.findUnique({ where: { id } });
    if (!proposal) {
      throw new AppError("Proposal not found", { statusCode: HttpStatus.NOT_FOUND });
    }
    if (proposal.status === "CONVERTED" || proposal.status === "PROCESSING") {
      throw new AppError(`Proposal is already ${proposal.status.toLowerCase()}`, {
        statusCode: HttpStatus.CONFLICT,
        code: "INVALID_STATUS",
      });
    }
    await db.dataBase.crmSavedProposal.update({
      where: { id },
      data: { status: "PROCESSING" },
    });
    // Fire-and-forget — import lazily to avoid circular deps
    import("@services/refq/nse/auto_process_rfq/proposal_Automate")
      .then(({ proposalProcessing }) => proposalProcessing(id))
      .catch((err: unknown) => {
        console.error(`[proposalProcessing] id=${id} failed:`, err);
        db.dataBase.crmSavedProposal
          .update({ where: { id }, data: { status: "FAILED", failedNote: String(err) } })
          .catch(() => undefined);
      });
    return { queued: true, id };
  }

  async markWaitingForApproval(id: number) {
    const proposal = await db.dataBase.crmSavedProposal.findUnique({ where: { id } });
    if (!proposal) {
      throw new AppError("Proposal not found", { statusCode: HttpStatus.NOT_FOUND });
    }
    await db.dataBase.crmSavedProposal.update({
      where: { id },
      data: { status: "WAITING_FOR_APPROVAL" },
    });
    return { success: true };
  }

  /**
   * Step 1 only for NSE RFQ participant proposals: POST add-ISIN to NSE and
   * sync RFQ master — no order creation, negotiation, or deal automation.
   */
  async createIsinRfqFromProposal(createdById: number, id: number) {
    const proposal = await this.getMyProposalById(createdById, id);
    const rfqPayload = buildAddIsinPayloadFromProposal(proposal);
    const created = await this.rfqMasterService.createNewRfq(rfqPayload, createdById);

    return {
      rfq: Array.isArray(created) ? created[0] : created,
      redirectTo: rfqManageRedirectFromCreateResult(created),
      mode: "create_isin_only" as const,
    };
  }
}

