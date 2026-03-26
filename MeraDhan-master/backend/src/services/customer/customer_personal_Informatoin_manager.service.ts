import { db } from "@core/database/database";
import type { appSchema } from "@root/schema";
import { AppError } from "@utils/error/AppError";
import type z from "zod";

export class CustomerPersonalInformationManager {
  async createPersonalInfo(
    customerProfileId: number,
    data: z.infer<typeof appSchema.customer.createPersonalInfoSchema>,
  ) {
    const createdPersonalInfo =
      await db.dataBase.customerPersonalInfoModel.create({
        data: {
          annualGrossIncome: data.annualGrossIncome,
          fatherOrSpouseName: data.fatherOrSpouseName,
          maritalStatus: data.maritalStatus,
          mothersName: data.mothersName,
          nationality: data.nationality,
          occupationType: data.occupationType,
          qualification: data.qualification,
          residentialStatus: data.residentialStatus,
          customerProfileDataModel: {
            connect: { id: customerProfileId },
          },
        },
      });

    if (!createdPersonalInfo) {
      throw new AppError("Failed to create personal information", {
        statusCode: 404,
        code: "PERSONAL_INFO_CREATE_FAILED",
      });
    }
    return createdPersonalInfo;
  }

  async getPersonalInfo(personalInfoId: number) {
    const personalInformation =
      await db.dataBase.customerPersonalInfoModel.findUnique({
        where: { id: personalInfoId },
      });
    if (!personalInformation) {
      throw new AppError(`Personal info with ID ${personalInfoId} not found`, {
        statusCode: 404,
        code: "PERSONAL_INFO_NOT_FOUND",
      });
    }

    return personalInformation;
  }

  async getCustomerPersonalInfo(customerProfileId: number) {
    const customerPersonalInformation =
      await db.dataBase.customerPersonalInfoModel.findFirst({
        where: { customerProfileDataModel: { id: customerProfileId } },
      });
    if (!customerPersonalInformation) {
      throw new AppError(
        `No personal information found for customer ${customerProfileId}`,
        {
          statusCode: 404,
          code: "CUSTOMER_PERSONAL_INFO_NOT_FOUND",
        },
      );
    }
    return customerPersonalInformation;
  }

  async removePersonalInfo(personalInfoId: number) {
    const existing = await db.dataBase.customerPersonalInfoModel.findUnique({
      where: { id: personalInfoId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError(`Personal info with ID ${personalInfoId} not found`, {
        statusCode: 404,
        code: "PERSONAL_INFO_NOT_FOUND",
      });
    }

    await db.dataBase.customerPersonalInfoModel.delete({
      where: { id: personalInfoId },
    });

    return true;
  }

  async updatePersonalInfo(
    personalInfoId: number,
    data: z.infer<typeof appSchema.customer.updatePersonalInfoSchema>,
  ) {
    const existing = await db.dataBase.customerPersonalInfoModel.findUnique({
      where: { id: personalInfoId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError(`Personal info with ID ${personalInfoId} not found`, {
        statusCode: 404,
        code: "PERSONAL_INFO_NOT_FOUND",
      });
    }

    const updatedPersonalInfo =
      await db.dataBase.customerPersonalInfoModel.update({
        where: { id: personalInfoId },
        data: {
          annualGrossIncome: data.annualGrossIncome?.trim(),
          fatherOrSpouseName: data.fatherOrSpouseName?.trim(),
          maritalStatus: data.maritalStatus?.trim(),
          mothersName: data.mothersName?.trim(),
          nationality: data.nationality?.trim(),
          occupationType: data.occupationType?.trim(),
          qualification: data.qualification?.trim(),
          residentialStatus: data.residentialStatus?.trim(),
        },
      });

    if (!updatedPersonalInfo) {
      throw new AppError("Failed to update personal information", {
        statusCode: 404,
        code: "PERSONAL_INFO_UPDATE_FAILED",
      });
    }

    return updatedPersonalInfo;
  }
}
