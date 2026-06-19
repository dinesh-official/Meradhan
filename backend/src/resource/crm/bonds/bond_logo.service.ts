import { AppError, HttpStatus } from "@utils/error/AppError";
import { db } from "@core/database/database";

export class BondLogoService {
  async get(isin: string) {
    const bond = await db.dataBase.bonds.findUnique({
      where: { isin: isin.trim().toUpperCase() },
      select: { isin: true, logoUrl: true },
    });
    if (!bond) {
      throw new AppError("Bond not found", { statusCode: HttpStatus.NOT_FOUND });
    }
    return bond;
  }

  async update(isin: string, logoUrl: string) {
    const normalizedIsin = isin.trim().toUpperCase();
    const trimmedUrl = logoUrl.trim();
    if (!trimmedUrl) {
      throw new AppError("Logo URL is required", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    try {
      return await db.dataBase.bonds.update({
        where: { isin: normalizedIsin },
        data: { logoUrl: trimmedUrl },
        select: { isin: true, logoUrl: true },
      });
    } catch {
      throw new AppError("Bond not found", { statusCode: HttpStatus.NOT_FOUND });
    }
  }

  async remove(isin: string) {
    const normalizedIsin = isin.trim().toUpperCase();
    try {
      return await db.dataBase.bonds.update({
        where: { isin: normalizedIsin },
        data: { logoUrl: null },
        select: { isin: true, logoUrl: true },
      });
    } catch {
      throw new AppError("Bond not found", { statusCode: HttpStatus.NOT_FOUND });
    }
  }
}
