import { db } from "@core/database/database";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { RazorpayRouteSettlementAccountsRepo } from "./razorpay_route_settlement_accounts.repo";

export type CreateSettlementAccountInput = {
  razorpayAccountId: string;
  accountNumber: string;
  ifscCode: string;
  beneficiaryName: string;
  isDefault?: boolean;
};

export type UpdateSettlementAccountInput = Partial<
  Omit<CreateSettlementAccountInput, "razorpayAccountId">
> & {
  isDefault?: boolean;
};

export class RazorpayRouteSettlementAccountsService {
  async listByRazorpayAccount(razorpayAccountId: string) {
    return RazorpayRouteSettlementAccountsRepo.findManyByRazorpayAccountId(
      razorpayAccountId
    );
  }

  async create(input: CreateSettlementAccountInput) {
    // ensure route account exists
    const exists = await db.dataBase.razorpayRouteAccount.findUnique({
      where: { razorpayAccountId: input.razorpayAccountId },
      select: { id: true },
    });
    if (!exists) {
      throw new AppError("Razorpay Route account not found", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "RAZORPAY_ROUTE_ACCOUNT_NOT_FOUND",
      });
    }

    const makeDefault = !!input.isDefault;
    return db.dataBase.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.razorpayRouteSettlementAccount.updateMany({
          where: { razorpayAccountId: input.razorpayAccountId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.razorpayRouteSettlementAccount.create({
        data: {
          razorpayAccountId: input.razorpayAccountId,
          accountNumber: input.accountNumber,
          ifscCode: input.ifscCode,
          beneficiaryName: input.beneficiaryName,
          isDefault: makeDefault,
        },
      });
    });
  }

  async update(
    id: number,
    razorpayAccountId: string,
    payload: UpdateSettlementAccountInput
  ) {
    const record = await db.dataBase.razorpayRouteSettlementAccount.findFirst({
      where: { id, razorpayAccountId },
    });
    if (!record) {
      throw new AppError("Settlement account not found", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "RAZORPAY_ROUTE_SETTLEMENT_ACCOUNT_NOT_FOUND",
      });
    }

    return db.dataBase.$transaction(async (tx) => {
      if (payload.isDefault === true) {
        await tx.razorpayRouteSettlementAccount.updateMany({
          where: { razorpayAccountId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.razorpayRouteSettlementAccount.update({
        where: { id: record.id },
        data: {
          ...(payload.accountNumber ? { accountNumber: payload.accountNumber } : {}),
          ...(payload.ifscCode ? { ifscCode: payload.ifscCode } : {}),
          ...(payload.beneficiaryName ? { beneficiaryName: payload.beneficiaryName } : {}),
          ...(typeof payload.isDefault === "boolean"
            ? { isDefault: payload.isDefault }
            : {}),
        },
      });
    });
  }

  async delete(id: number, razorpayAccountId: string) {
    const record = await db.dataBase.razorpayRouteSettlementAccount.findFirst({
      where: { id, razorpayAccountId },
    });
    if (!record) {
      throw new AppError("Settlement account not found", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "RAZORPAY_ROUTE_SETTLEMENT_ACCOUNT_NOT_FOUND",
      });
    }

    await db.dataBase.razorpayRouteSettlementAccount.delete({
      where: { id: record.id },
    });
    return true;
  }
}

