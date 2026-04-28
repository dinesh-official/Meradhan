import { AppError, HttpStatus } from "@utils/error/AppError";
import { CrmSavedProposalsRepo } from "./crm_saved_proposals.repo";

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
}

