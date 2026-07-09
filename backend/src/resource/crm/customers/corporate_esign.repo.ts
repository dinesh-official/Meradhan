import { db } from "@core/database/database";
import type { ESignRequestStatus } from "@databases/generated/prisma/postgres";

export type CreateCorporateESignRequestInput = {
  corporateKycModelId: number;
  eSignDocumentUrl: string | null;
  personName: string;
  authorisedSignatoryId?: number | null;
  signatoryEmail?: string | null;
  signatoryPan?: string | null;
  notes?: string | null;
  createdByCrmUserId?: number | null;
};

export type UpdateCorporateESignRequestInput = {
  status?: ESignRequestStatus;
  signFileUrl?: string | null;
  eSignDocumentUrl?: string | null;
  /** Pass `true` to stamp `submittedAt = now()`. Useful when the operator
   *  uploads the signed PDF and moves the row to COMPLETED. */
  markSubmittedNow?: boolean;
  notes?: string | null;
};

export class CorporateESignRequestsRepo {
  async listByCorporateKycId(corporateKycModelId: number) {
    return db.dataBase.corporateESignRequestModel.findMany({
      where: { corporateKycModelId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(args: { corporateKycModelId: number; requestId: number }) {
    return db.dataBase.corporateESignRequestModel.findFirst({
      where: {
        id: args.requestId,
        corporateKycModelId: args.corporateKycModelId,
      },
    });
  }

  async create(input: CreateCorporateESignRequestInput) {
    return db.dataBase.corporateESignRequestModel.create({
      data: {
        corporateKycModelId: input.corporateKycModelId,
        eSignDocumentUrl: input.eSignDocumentUrl,
        personName: input.personName,
        authorisedSignatoryId: input.authorisedSignatoryId ?? undefined,
        signatoryEmail: input.signatoryEmail ?? undefined,
        signatoryPan: input.signatoryPan ?? undefined,
        notes: input.notes ?? undefined,
        createdByCrmUserId: input.createdByCrmUserId ?? undefined,
      },
    });
  }

  async update(
    args: { corporateKycModelId: number; requestId: number },
    input: UpdateCorporateESignRequestInput,
  ) {
    const existing = await this.findById(args);
    if (!existing) return null;

    return db.dataBase.corporateESignRequestModel.update({
      where: { id: args.requestId },
      data: {
        status: input.status ?? undefined,
        signFileUrl: input.signFileUrl ?? undefined,
        eSignDocumentUrl: input.eSignDocumentUrl ?? undefined,
        notes: input.notes ?? undefined,
        submittedAt: input.markSubmittedNow
          ? new Date()
          : existing.submittedAt ?? undefined,
      },
    });
  }

  async deleteById(args: { corporateKycModelId: number; requestId: number }) {
    const existing = await this.findById(args);
    if (!existing) return null;
    return db.dataBase.corporateESignRequestModel.delete({
      where: { id: args.requestId },
    });
  }
}
