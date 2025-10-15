import type z from "zod";
import type { ICustomerProfileManagerInterface } from "./customermanager.interface";
import type { appSchema } from "@root/schema";
import { hashingUtils } from "@utils/hash/hashing.utils";
import { db } from "@core/database/database";
import { AppError } from "@utils/error/AppError";
export class CustomerManager implements ICustomerProfileManagerInterface {
  async createCustomerProfile(
    data: z.infer<typeof appSchema.customer.createNewCustomerSchema>
  ): ReturnType<ICustomerProfileManagerInterface["createCustomerProfile"]> {
    const hashPassword = await hashingUtils.hashPassword(data.password);
    const userName = new Date().getTime();
    const createdCustomerResponse =
      await db.dataBase.customerProfileDataModel.create({
        data: {
          emailAddress: data.emailId,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          gender: data.gender,
          whatsAppNo: data.whatsAppNo || data.phoneNo,
          phoneNo: data.phoneNo,
          userName: userName.toString(),
          kycStatus: data.kycStatus,
          userType: data.userType,

          utility: {
            create: {
              signinWith: "CREDENTIALS",
              password: hashPassword,
              accountStatus: data.status,
              isEmailVerified: data.isEmailVerified,
              isPhoneVerified: data.isPhoneVerified,
              termsAccepted: data.termsAccepted,
              whatsAppNotificationAllow: data.whatsAppNotificationAllow,
            },
          },
        },
      });

    return createdCustomerResponse;
  }

  async getCustomerProfile(customerProfileId: number) {
    const customerProfile =
      await db.dataBase.customerProfileDataModel.findUnique({
        where: { id: customerProfileId },
      });

    if (!customerProfile) {
      throw new AppError(`Customer with id ${customerProfileId} not found`, {
        statusCode: 404,
        code: "CUSTOMER_NOT_FOUND",
      });
    }
    return customerProfile;
  }

  async getCustomerProfileByEmail(emailAddress: string) {
    const customerProfile =
      await db.dataBase.customerProfileDataModel.findUnique({
        where: { emailAddress: emailAddress },
      });

    if (!customerProfile) {
      throw new AppError(`Customer with email ${emailAddress} not found`, {
        statusCode: 404,
        code: "CUSTOMER_NOT_FOUND",
      });
    }

    return customerProfile;
  }

  async getCustomerProfileByUsername(userName: string) {
    const customerProfile =
      await db.dataBase.customerProfileDataModel.findUnique({
        where: { userName: userName },
      });

    if (!customerProfile) {
      throw new AppError(`Customer with userName ${userName} not found`, {
        statusCode: 404,
        code: "CUSTOMER_NOT_FOUND",
      });
    }

    return customerProfile;
  }

  async updateCustomerProfile(
    customerProfileId: number,
    data: z.infer<typeof appSchema.customer.updateCustomerProfileSchema>
  ) {
    const existing = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerProfileId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError(`Customer with ID ${customerProfileId} not found`, {
        statusCode: 404,
        code: "CUSTOMER_NOT_FOUND",
      });
    }

    const utilityUpdate: Record<string, unknown> = {
      accountStatus: data.status,
      whatsAppNotificationAllow: data.whatsAppNotificationAllow,
    };

    const updatedCustomerProfileData =
      await db.dataBase.customerProfileDataModel.update({
        where: { id: customerProfileId },
        data: {
          firstName: data.firstName?.trim(),
          middleName: data.middleName?.trim(),
          lastName: data.lastName?.trim(),
          emailAddress: data.emailId?.trim().toLowerCase(),
          phoneNo: data.phoneNo?.trim(),
          whatsAppNo: data.whatsAppNo?.trim(),
          userType: data.userType,
          gender: data.gender,
          utility: { update: utilityUpdate },
        },
      });

    if (!updatedCustomerProfileData) {
      throw new AppError(`Failed to update customer profile`, {
        statusCode: 400,
        code: "CUSTOMER_UPDATE_FAILED",
      });
    }

    return updatedCustomerProfileData;
  }

  async removeCustomerProfile(customerProfileId: number) {
    const existing = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerProfileId },
    });

    if (!existing) {
      throw new AppError(`Customer with ID ${customerProfileId} not found`, {
        statusCode: 404,
        code: "CUSTOMER_NOT_FOUND",
      });
    }

    await db.dataBase.customerPersonalInfoModel.delete({
      where: { id: customerProfileId },
    });

    return true; // we can change this
  }

  async updateKycStatus(
    customerProfileId: number,
    kycStatus: "PENDING" | "VERIFIED" | "REJECTED",
    verifiedBy?: number
  ) {
    const existing = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerProfileId },
      select: { kycStatus: true },
    });

    if (!existing) {
      throw new AppError(`Customer with ID ${customerProfileId} not found`, {
        statusCode: 404,
        code: "CUSTOMER_NOT_FOUND",
      });
    }

    if (existing.kycStatus === kycStatus) {
      throw new AppError(`Customer KYC status is already '${kycStatus}'`, {
        statusCode: 409,
        code: "KYC_STATUS_ALREADY_SET",
      });
    }

    const updatedCustomer = await db.dataBase.customerProfileDataModel.update({
      where: { id: customerProfileId },
      data: {
        kycStatus,
        VerifiedBy: verifiedBy,
        updatedAt: new Date(),
      },
    });

    return updatedCustomer;
  }
}
