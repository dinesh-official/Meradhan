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

  async deleteById(args: { corporateKycModelId: number; attachmentId: number }) {
    // Ensure the attachment belongs to this corporate KYC row (prevents deleting others' records)
    const existing = await db.dataBase.corporateKycAttachmentModel.findFirst({
      where: {
        id: args.attachmentId,
        corporateKycModelId: args.corporateKycModelId,
      },
    });
    if (!existing) return null;
    return db.dataBase.corporateKycAttachmentModel.delete({
      where: { id: args.attachmentId },
    });
  }
}

