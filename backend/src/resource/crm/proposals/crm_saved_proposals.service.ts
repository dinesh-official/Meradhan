import { AppError, HttpStatus } from "@utils/error/AppError";
import { CrmSavedProposalsRepo } from "./crm_saved_proposals.repo";
import { db } from "@core/database/database";

export class CrmSavedProposalsService {
  async createProposal(createdById: number, input: {
    customerProfileId: number;
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
    return CrmSavedProposalsRepo.create({
      createdById,
      customerProfileId: input.customerProfileId,
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
}

