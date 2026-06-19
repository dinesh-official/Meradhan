import { db } from "@core/database/database";

export type CreateBondDocumentInput = {
  isin: string;
  name: string;
  fileUrl: string;
  fileName?: string | null;
  createdByCrmUserId?: number | null;
};

export type UpdateBondDocumentInput = {
  name?: string;
  fileUrl?: string;
  fileName?: string | null;
};

export class BondDocumentsRepo {
  async listByIsin(isin: string) {
    return db.dataBase.bondDocument.findMany({
      where: { isin },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByIdForIsin(isin: string, id: number) {
    return db.dataBase.bondDocument.findFirst({
      where: { id, isin },
    });
  }

  async create(input: CreateBondDocumentInput) {
    return db.dataBase.bondDocument.create({
      data: {
        isin: input.isin,
        name: input.name,
        fileUrl: input.fileUrl,
        fileName: input.fileName ?? undefined,
        createdByCrmUserId: input.createdByCrmUserId ?? undefined,
      },
    });
  }

  async update(isin: string, id: number, input: UpdateBondDocumentInput) {
    const existing = await this.findByIdForIsin(isin, id);
    if (!existing) return null;
    return db.dataBase.bondDocument.update({
      where: { id },
      data: {
        ...(input.name != null ? { name: input.name } : {}),
        ...(input.fileUrl != null ? { fileUrl: input.fileUrl } : {}),
        ...(input.fileName !== undefined ? { fileName: input.fileName } : {}),
      },
    });
  }

  async deleteById(isin: string, id: number) {
    const existing = await this.findByIdForIsin(isin, id);
    if (!existing) return null;
    return db.dataBase.bondDocument.delete({ where: { id } });
  }
}
