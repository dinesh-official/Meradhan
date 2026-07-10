import { db } from "@core/database/database";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { BondDocumentsRepo } from "./bond_documents.repo";

export class BondDocumentsService {
  private repo = new BondDocumentsRepo();

  private async assertBondExists(isin: string) {
    const bond = await db.dataBase.bonds.findUnique({ where: { isin } });
    if (!bond) {
      throw new AppError(`Bond not found for ISIN ${isin}`, {
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return bond;
  }

  async list(isin: string) {
    await this.assertBondExists(isin);
    return this.repo.listByIsin(isin);
  }

  async create(
    isin: string,
    input: {
      name: string;
      fileUrl: string;
      fileName?: string | null;
      createdByCrmUserId?: number | null;
    },
  ) {
    await this.assertBondExists(isin);
    return this.repo.create({
      isin,
      name: input.name,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      createdByCrmUserId: input.createdByCrmUserId,
    });
  }

  async update(
    isin: string,
    id: number,
    input: { name?: string; fileUrl?: string; fileName?: string | null },
  ) {
    await this.assertBondExists(isin);
    const updated = await this.repo.update(isin, id, input);
    if (!updated) {
      throw new AppError("Document not found", { statusCode: HttpStatus.NOT_FOUND });
    }
    return updated;
  }

  async remove(isin: string, id: number) {
    await this.assertBondExists(isin);
    const deleted = await this.repo.deleteById(isin, id);
    if (!deleted) {
      throw new AppError("Document not found", { statusCode: HttpStatus.NOT_FOUND });
    }
    return deleted;
  }
}
