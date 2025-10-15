import { db, KYCStatus } from "@core/database/database";
import type { appSchema } from "@root/schema";
import { AppError } from "@utils/error/AppError";
import { generateUsername } from "@utils/generate/generateUsername";
import { hashingUtils } from "@utils/hash/hashing.utils";
import type z from "zod";
import { type ICustomerProfileManagerInterface } from "./customermanager.interface";


export class CustomerProfileManager implements ICustomerProfileManagerInterface {
  async createCustomerProfile(
    data: z.infer<typeof appSchema.customer.createNewCustomerSchema>,
    createdBy?: number
  ): ReturnType<ICustomerProfileManagerInterface["createCustomerProfile"]> {

    const user = await this.getCustomerProfileByEmail(data.emailId)
    if (user) {
      throw new AppError("Email is already used")
    }

    const hashPassword = await hashingUtils.hashPassword(data.password);
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
          userName: generateUsername(),
          kycStatus: data.kycStatus,
          userType: data.userType,
          createdBy: createdBy,

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

    return customerProfile;
  }

  async getCustomerProfileByEmail(emailAddress: string) {
    const customerProfile =
      await db.dataBase.customerProfileDataModel.findUnique({
        where: { emailAddress: emailAddress },

      });

    return customerProfile;
  }

  async getCustomerProfileByUsername(userName: string) {
    const customerProfile =
      await db.dataBase.customerProfileDataModel.findUnique({
        where: { userName: userName },
      });



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

    await db.dataBase.customerProfileDataModel.delete({
      where: { id: customerProfileId },
    });

    return true; // we can change this
  }

  async updateKycStatus(
    customerProfileId: number,
    kycStatus: KYCStatus,
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
