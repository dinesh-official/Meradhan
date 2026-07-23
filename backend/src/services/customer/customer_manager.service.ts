import { db, KYCStatus } from "@core/database/database";
import type { appSchema } from "@root/schema";
import { AppError } from "@utils/error/AppError";
import { removeCountryCode } from "@utils/filters/convert";
import { generateUsername } from "@utils/generate/generate_username";
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
          ...(data.firstName !== undefined && { firstName: data.firstName.trim() }),
          ...(data.middleName !== undefined && { middleName: data.middleName.trim() }),
          ...(data.lastName !== undefined && { lastName: data.lastName.trim() }),
          ...(data.legalEntityName !== undefined && {
            legalEntityName: data.legalEntityName?.trim() ?? null,
          }),
          ...(data.emailId !== undefined && {
            emailAddress: data.emailId.trim().toLowerCase(),
          }),
          ...(data.phoneNo !== undefined && {
            phoneNo: "+91" + removeCountryCode(data.phoneNo)?.trim(),
          }),
          ...(data.whatsAppNo !== undefined && {
            whatsAppNo: "+91" + removeCountryCode(data.whatsAppNo?.trim()),
          }),
          ...(data.userType !== undefined && { userType: data.userType }),
          ...(data.gender !== undefined && { gender: data.gender }),
          ...(data.kycStatus !== undefined && { kycStatus: data.kycStatus }),
          ...(data.crmRiskProfile !== undefined && {
            crmRiskProfile: data.crmRiskProfile,
          }),
          utility: {
            update: {
              ...(data.status !== undefined && { accountStatus: data.status }),
              ...(data.whatsAppNotificationAllow !== undefined && {
                whatsAppNotificationAllow: data.whatsAppNotificationAllow,
              }),
              ...(data.termsAccepted !== undefined && { termsAccepted: data.termsAccepted }),
              ...(data.isEmailVerified !== undefined && {
                isEmailVerified: data.isEmailVerified,
              }),
              ...(data.isPhoneVerified !== undefined && {
                isPhoneVerified: data.isPhoneVerified,
              }),
              ...(data.relationshipManagerId !== undefined && {
                relationshipManager: data.relationshipManagerId
                  ? { connect: { id: data.relationshipManagerId } }
                  : { disconnect: true },
              }),
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

    // Soft-delete only (trash). Mark CLOSED and bump tokenVersion so login/sessions fail.
    const deleteCustomer = await db.dataBase.customerProfileDataModel.update({
      where: { id: customerProfileId },
      data: {
        isDeleted: true,
        utility: {
          update: {
            accountStatus: "CLOSED",
            tokenVersion: { increment: 1 },
          },
        },
      },
    });

    return deleteCustomer;
  }

  /** KYC and KRA must both be VERIFIED before bond purchase / place-order flows. */
  async assertCustomerCanPlaceOrder(customerProfileId: number): Promise<void> {
    const customer = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerProfileId },
      select: { kycStatus: true, kraStatus: true },
    });

    if (!customer) {
      throw new AppError(`Customer with ID ${customerProfileId} not found`, {
        statusCode: 404,
        code: "CUSTOMER_NOT_FOUND",
      });
    }

    if (customer.kycStatus !== "VERIFIED") {
      throw new AppError(
        "Please complete your KYC verification before placing an order.",
        { statusCode: 403, code: "KYC_NOT_VERIFIED" },
      );
    }

    if (String(customer.kraStatus ?? "").trim().toUpperCase() !== "VERIFIED") {
      throw new AppError(
        "Your KRA registration must be verified before placing an order.",
        { statusCode: 403, code: "KRA_NOT_VERIFIED" },
      );
    }
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
