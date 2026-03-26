import { db, type DataBaseSchema } from "@core/database/database";
import { AppError } from "@utils/error/AppError";

const corporateKycInclude = {
  bankAccounts: true,
  dematAccounts: true,
  directors: true,
  promoters: true,
  authorisedSignatories: true,
} as const;

export class CorporateKycRepo {
  async findByCustomerId(customerId: number) {
    return db.dataBase.corporateKycModel.findUnique({
      where: { customerProfileDataModelId: customerId },
      include: corporateKycInclude,
    });
  }

  async upsert(
    customerId: number,
    payload: DataBaseSchema.CorporateKycModelCreateInput
  ) {
    const existing = await this.findByCustomerId(customerId);
    if (existing) {
      return db.dataBase.corporateKycModel.update({
        where: { id: existing.id },
        data: payload as DataBaseSchema.CorporateKycModelUpdateInput,
        include: corporateKycInclude,
      });
    }
    return db.dataBase.corporateKycModel.create({
      data: {
        ...payload,
        customerProfileDataModel: { connect: { id: customerId } },
      } as DataBaseSchema.CorporateKycModelCreateInput,
      include: corporateKycInclude,
    });
  }

  async ensureCustomerExists(customerId: number) {
    const customer = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new AppError("Customer not found", {
        code: "CUSTOMER_NOT_FOUND",
        statusCode: 404,
      });
    }
    return customer;
  }
}
