import { db, KYCStatus } from "@core/database/database";
import type { appSchema } from "@root/schema";
import { AppError } from "@utils/error/AppError";
import { removeCountryCode } from "@utils/filters/convert";
import { generateUsername } from "@utils/generate/generate_username";
import { hashingUtils } from "@utils/hash/hashing_utils";
import type z from "zod";

export class CustomerProfileManager {
  async createCustomerProfile(
    data: z.infer<typeof appSchema.customer.createNewCustomerSchema>,
    createdBy?: number
  ) {
    const user = await this.getCustomerProfileByEmail(data.emailId);
    if (user) {
      throw new AppError("Email is already used");
    }

    const hashPassword = await hashingUtils.hashPassword(data.password);
    const createdCustomerResponse =
      await db.dataBase.customerProfileDataModel.create({
        data: {
          emailAddress: data.emailId,
          firstName: data.firstName,
          middleName: data.middleName || "",
          lastName: data.lastName,
          legalEntityName: data.legalEntityName?.trim() ?? null,
          gender: data.gender,
          whatsAppNo:
            (data.whatsAppNo && "+91" + removeCountryCode(data.whatsAppNo)) ||
            "+91" + removeCountryCode(data.phoneNo),
          phoneNo: "+91" + removeCountryCode(data.phoneNo),
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
              cRMUserDataModelId: data.relationshipManagerId,
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

  async getCustomerProfileByPhone(phoneNo: string) {
    const customerProfile =
      await db.dataBase.customerProfileDataModel.findFirst({
        where: { phoneNo: phoneNo },
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
    console.log(data);

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

    const updatedCustomerProfileData =
      await db.dataBase.customerProfileDataModel.update({
        where: { id: customerProfileId },
        data: {
          firstName: data.firstName?.trim(),
          middleName: data.middleName?.trim(),
          lastName: data.lastName?.trim(),
          legalEntityName: data.legalEntityName !== undefined ? (data.legalEntityName?.trim() ?? null) : undefined,
          emailAddress: data.emailId?.trim().toLowerCase(),
          phoneNo: "+91" + removeCountryCode(data.phoneNo)?.trim(),
          whatsAppNo: "+91" + removeCountryCode(data.whatsAppNo?.trim()),
          userType: data.userType,
          gender: data.gender,
          kycStatus: data.kycStatus,
          utility: {
            update: {
              accountStatus: data.status,
              whatsAppNotificationAllow: data.whatsAppNotificationAllow,
              termsAccepted: data.termsAccepted,
              isEmailVerified: data.isEmailVerified,
              isPhoneVerified: data.isPhoneVerified,
              relationshipManager: data.relationshipManagerId
                ? {
                    connect: {
                      id: data.relationshipManagerId,
                    },
                  }
                : undefined,
            },
          },
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

  async softDeleteCustomerProfile(customerProfileId: number) {
    const existing = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerProfileId },
    });

    if (!existing) {
      throw new AppError(`Customer with ID ${customerProfileId} not found`, {
        statusCode: 404,
        code: "CUSTOMER_NOT_FOUND",
      });
    }

    const deleteCustomer = await db.dataBase.customerProfileDataModel.update({
      where: { id: customerProfileId },
      data: {
        isDeleted: true,
      },
    });

    return deleteCustomer; // we can change this
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

    const deleteUser = await db.dataBase.customerProfileDataModel.delete({
      where: { id: customerProfileId },
    });

    return deleteUser; // we can change this
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

  async setLatestLoginTime(customerId: number) {
    await db.dataBase.customerProfileDataModel.update({
      where: { id: customerId },
      data: {
        utility: {
          update: {
            lastLogin: new Date(),
          },
        },
      },
    });
  }
}
