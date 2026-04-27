import { db } from "@core/database/database";

export type CreateCorporateKycAttachmentInput = {
  corporateKycModelId: number;
  label: string;
  fileUrl: string;
  createdByCrmUserId?: number | null;
};

export class CorporateKycAttachmentsRepo {
  async listByCorporateKycId(corporateKycModelId: number) {
    return db.dataBase.corporateKycAttachmentModel.findMany({
      where: { corporateKycModelId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(input: CreateCorporateKycAttachmentInput) {
    return db.dataBase.corporateKycAttachmentModel.create({
      data: {
        corporateKycModelId: input.corporateKycModelId,
        label: input.label,
        fileUrl: input.fileUrl,
        createdByCrmUserId: input.createdByCrmUserId ?? undefined,
      },
    });
  }
}

