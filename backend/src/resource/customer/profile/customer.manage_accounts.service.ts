/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@core/database/database";
import { getOptionalEmailTitleFromSources, type appSchema } from "@root/schema";
import { ParticipantManager } from "@services/refq/nse/cbrics_manager.service";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { sendBankAccountSubmissionReceivedEmail } from "@jobs/helper/send_emails";
import type z from "zod";
import { meraDhanDematAccountSubmissionReceivedEmailText } from "@emails/text/meraDhanDematAccountSubmissionReceivedEmailText";
import { meraDhanDefaultBankAccountUpdatedEmailText } from "@emails/text/meraDhanDefaultBankAccountUpdatedEmailText";
import { meraDhanDefaultDematAccountUpdatedEmailText } from "@emails/text/meraDhanDefaultDematAccountUpdatedEmailText";
import { EmailCommunication } from "../../../communication/email_communication";
import logger from "@utils/logger/logger";

function formatCaughtError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

const KYC_VERIFIED_REQUIRED_MSG =
  "You cannot add, update, or delete bank or demat accounts until your KYC is verified.";

const CUSTOMER_EMAIL_GENDER_SELECT = {
  emailAddress: true,
  firstName: true,
  lastName: true,
  gender: true,
  panCard: { select: { gender: true } },
  aadhaarCard: { select: { gender: true } },
} as const;

export class CustomerManageAccountsService {
  private cbricsManager = new ParticipantManager();

  /** Throws if customer KYC is not VERIFIED. Use before any bank/demat add/update/delete. */
  private async assertKycVerified(customerId: number): Promise<void> {
    const customer = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
      select: { kycStatus: true },
    });
    if (!customer || customer.kycStatus !== "VERIFIED") {
      throw new AppError(KYC_VERIFIED_REQUIRED_MSG, {
        code: "KYC_NOT_VERIFIED",
        statusCode: 403,
      });
    }
  }

  async addBankAccount(
    customerId: number,
    bankDetails: z.infer<typeof appSchema.kyc.bankInfoSchema>
  ): Promise<boolean> {
    await this.assertKycVerified(customerId);
    const existingAccount =
      await db.dataBase.customerProfileDataModel.findFirst({
        where: {
          id: customerId,
          bankAccounts: {
            some: {
              accountNumber: bankDetails.accountNumber,
              ifscCode: bankDetails.ifscCode,
            },
          },
        },
      });

    if (existingAccount) {
      throw new AppError("Bank account already exists.");
    }

    // unselct existing primary accounts
    if (bankDetails.isDefault) {
      await db.dataBase.customersBankAccountModel.updateMany({
        where: {
          customerProfileDataModelId: customerId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Add bank account logic here (e.g., save to database)
    await db.dataBase.customerProfileDataModel.update({
      where: { id: customerId },
      data: {
        bankAccounts: {
          create: {
            accountNumber: bankDetails.accountNumber,
            ifscCode: bankDetails.ifscCode,
            bankName: bankDetails.bankName,
            accountHolderName: bankDetails.beneficiary_name,
            bankAccountType: bankDetails.bankAccountType,
            branch: bankDetails.branchName,
            isPrimary: bankDetails.isDefault,
            isVerified: true,
            verifyDate: new Date(),
          },
        },
      },
    });

    // Acknowledgement email (KYC verified users only reach this point)
    try {
      const customer = await db.dataBase.customerProfileDataModel.findUnique({
        where: { id: customerId },
        select: CUSTOMER_EMAIL_GENDER_SELECT,
      });
      if (customer?.emailAddress) {
        const customerName =
          `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
          "Customer";
        const title = getOptionalEmailTitleFromSources(customer);
        const last4Digits = String(bankDetails.accountNumber ?? "")
          .replace(/\s+/g, "")
          .slice(-4);
        await sendBankAccountSubmissionReceivedEmail({
          email: customer.emailAddress,
          customerName,
          title,
          last4Digits: last4Digits || "----",
        });
      }
    } catch (e) {
      console.log(e);
    }

    try {
      await this.cbricsManager.addBankAccount(customerId, {
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        bankName: bankDetails.bankName,
        isPrimary: bankDetails.isDefault,
      });
    } catch (error) {
      console.log(error);
    }
    return true;
  }

  async removeBankAccount(
    customerId: number,
    bankAccountId: number
  ): Promise<boolean> {
    await this.assertKycVerified(customerId);
    const bankAccount = await db.dataBase.customersBankAccountModel.findFirst({
      where: {
        id: bankAccountId,
        customerProfileDataModelId: customerId,
      },
    });

    if (!bankAccount) {
      throw new AppError("Bank Account Numbert found.");
    }

    if (bankAccount.isPrimary) {
      throw new AppError("Cannot remove the primary bank account.");
    }
    try {
      await this.cbricsManager.deleteBankAccount(customerId, bankAccount);
    } catch (error) {
      console.log(error);
    }
    await db.dataBase.customersBankAccountModel.delete({
      where: {
        id: bankAccountId,
      },
    });

    return true;
  }

  async setPrimaryBankAccount(
    customerId: number,
    bankAccountId: number
  ): Promise<boolean> {
    await this.assertKycVerified(customerId);
    const bankAccount = await db.dataBase.customersBankAccountModel.findFirst({
      where: {
        id: bankAccountId,
        customerProfileDataModelId: customerId,
      },
    });

    if (!bankAccount) {
      throw new AppError("Bank Account Numbert found.");
    }

    // Must update NSE CBRICS first; if it fails, don't change CRM primary flags.
    try {
      await this.cbricsManager.setDefaultBankAccount(customerId, bankAccount);
    } catch (error) {
      const msg = formatCaughtError(error) || "CBRICS Request Failed";
      logger.logError("CBRICS set default bank failed", msg, {
        customerId,
        bankAccountId,
      });
      throw new AppError(msg, {
        statusCode: HttpStatus.BAD_GATEWAY,
        code: "CBRICS_SET_DEFAULT_BANK_FAILED",
      });
    }

    // Unset existing primary account
    await db.dataBase.customersBankAccountModel.updateMany({
      where: {
        customerProfileDataModelId: customerId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });

    // Set new primary account
    await db.dataBase.customersBankAccountModel.update({
      where: {
        id: bankAccountId,
      },
      data: {
        isPrimary: true,
      },
    });

    // Send confirmation email immediately when default bank account changes
    try {
      const customer = await db.dataBase.customerProfileDataModel.findUnique({
        where: { id: customerId },
        select: CUSTOMER_EMAIL_GENDER_SELECT,
      });
      if (customer?.emailAddress) {
        const customerName =
          `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
          "Customer";
        const title = getOptionalEmailTitleFromSources(customer);
        const last4Digits = String(bankAccount.accountNumber ?? "")
          .replace(/\s+/g, "")
          .slice(-4);

        const emailSend = new EmailCommunication();
        await emailSend.sendEmail({
          to: customer.emailAddress,
          subject: "Default Bank Account Updated Successfully",
          html: meraDhanDefaultBankAccountUpdatedEmailText({
            customerName,
            title,
            last4Digits: last4Digits || "----",
          }),
        });
      }
    } catch (e) {
      logger.logError(
        "Failed sending default bank account email after CRM update",
        formatCaughtError(e),
        { customerId },
      );
    }

    return true;
  }

  async addNewDematAccount(
    customerId: number,
    dematDetails: z.infer<typeof appSchema.customer.createDematAccountSchema>
  ): Promise<boolean> {
    await this.assertKycVerified(customerId);
    const existingAccount =
      await db.dataBase.customerProfileDataModel.findFirst({
        where: {
          id: customerId,
          dematAccounts: {
            some: {
              clientId: dematDetails.clientId,
            },
          },
        },
      });

    if (existingAccount) {
      throw new AppError("Demat account already exists.");
    }

    await db.dataBase.customerProfileDataModel.update({
      where: { id: customerId },
      data: {
        dematAccounts: {
          create: {
            accountHolderName: dematDetails.accountHolderName,
            accountType: dematDetails.accountType,
            clientId: dematDetails.clientId,
            depositoryName: dematDetails.depositoryName,
            depositoryParticipantName: dematDetails.depositoryParticipantName,
            dpId: dematDetails.dpId,
            primaryPanNumber: dematDetails.primaryPanNumber,
            isPrimary: dematDetails.isPrimary,
            isVerified: true,
            verifyDate: new Date(),
            sndPanNumber: dematDetails.sndPanNumber,
            trdPanNumber: dematDetails.trdPanNumber,
          },
        },
      },
    });

    // Acknowledgement email (KYC verified users only reach this point)
    try {
      const customer = await db.dataBase.customerProfileDataModel.findUnique({
        where: { id: customerId },
        select: CUSTOMER_EMAIL_GENDER_SELECT,
      });
      if (customer?.emailAddress) {
        const customerName =
          `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
          "Customer";
        const title = getOptionalEmailTitleFromSources(customer);
        const last4Digits = String(dematDetails.clientId ?? "")
          .replace(/\s+/g, "")
          .slice(-4);
        const emailSend = new EmailCommunication();
        await emailSend.sendEmail({
          to: customer.emailAddress,
          subject: "Demat Account Submission Received – Verification Pending",
          html: meraDhanDematAccountSubmissionReceivedEmailText({
            customerName,
            title,
            dpId: dematDetails.dpId,
            last4Digits: last4Digits || "----",
          }),
        });
      }
    } catch (e) {
      console.log(e);
    }

    try {
      await this.cbricsManager.addDpAccount(customerId, {
        clientId: dematDetails.clientId,
        dpType: dematDetails.depositoryName,
        dpId: dematDetails.dpId,
        isPrimary: dematDetails.isPrimary,
      });
    } catch (error) {
      console.log(error);
    }
    return true;
  }

  async removeDematAccount(
    customerId: number,
    dematAccountId: number
  ): Promise<boolean> {
    await this.assertKycVerified(customerId);
    const dematAccount = await db.dataBase.customersDematAccountModel.findFirst(
      {
        where: {
          id: dematAccountId,
          customerProfileDataModelId: customerId,
        },
      }
    );

    if (!dematAccount) {
      throw new AppError("Demat Account Numbert found.");
    }

    if (dematAccount.isPrimary) {
      throw new AppError("Cannot remove the primary demat account.");
    }

    // Delete demat account from nse system here if needed
    try {
      await this.cbricsManager.deleteDpAccount(customerId, dematAccount);
    } catch (error) {
      console.log(error);
    }

    await db.dataBase.customersDematAccountModel.delete({
      where: {
        id: dematAccountId,
      },
    });

    return true;
  }

  async setPrimaryDematAccount(
    customerId: number,
    dematAccountId: number
  ): Promise<boolean> {
    await this.assertKycVerified(customerId);
    const dematAccount = await db.dataBase.customersDematAccountModel.findFirst(
      {
        where: {
          id: dematAccountId,
          customerProfileDataModelId: customerId,
        },
      }
    );

    if (!dematAccount) {
      throw new AppError("Demat Account Numbert found.");
    }

    if (dematAccount.isPrimary) {
      throw new AppError(
        "Cannot set the primary demat account as primary again."
      );
    }

    // Must update NSE CBRICS first; if it fails, don't change CRM primary flags.
    try {
      await this.cbricsManager.setDefaultDpAccount(customerId, dematAccount);
    } catch (error) {
      const msg = formatCaughtError(error) || "CBRICS Request Failed";
      logger.logError("CBRICS set default demat failed", msg, {
        customerId,
        dematAccountId,
      });
      throw new AppError(msg, {
        statusCode: HttpStatus.BAD_GATEWAY,
        code: "CBRICS_SET_DEFAULT_DEMAT_FAILED",
      });
    }

    // Unset existing primary account
    await db.dataBase.customersDematAccountModel.updateMany({
      where: {
        customerProfileDataModelId: customerId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });

    // Set new primary account
    await db.dataBase.customersDematAccountModel.update({
      where: {
        id: dematAccountId,
      },
      data: {
        isPrimary: true,
      },
    });

    // Send confirmation email immediately when default demat account changes
    try {
      const customer = await db.dataBase.customerProfileDataModel.findUnique({
        where: { id: customerId },
        select: CUSTOMER_EMAIL_GENDER_SELECT,
      });
      if (customer?.emailAddress) {
        const customerName =
          `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
          "Customer";
        const title = getOptionalEmailTitleFromSources(customer);
        const last4Digits = String(dematAccount.clientId ?? "")
          .replace(/\s+/g, "")
          .slice(-4);

        const emailSend = new EmailCommunication();
        await emailSend.sendEmail({
          to: customer.emailAddress,
          subject: "Default Demat Account Updated Successfully",
          html: meraDhanDefaultDematAccountUpdatedEmailText({
            customerName,
            title,
            last4Digits: last4Digits || "----",
          }),
        });
      }
    } catch (e) {
      logger.logError(
        "Failed sending default demat account email after CRM update",
        formatCaughtError(e),
        { customerId },
      );
    }

    return true;
  }

  async saveRiskProfile(
    customerId: number,
    riskProfile: any[]
  ): Promise<boolean> {
    // Use a nested `upsert` instead of `update` so customers who don't yet
    // have a `CustomersRiskProfileModel` row (e.g. corporate users coming
    // from the e-sign flow without ever running the individual KYC
    // questionnaire) get one auto-created on first save. The previous
    // `update`-only branch threw P2025 ("record not found for nested
    // update on one-to-one relation") for that case.
    await db.dataBase.customerProfileDataModel.update({
      where: { id: customerId },
      data: {
        riskProfile: {
          upsert: {
            create: { data: riskProfile },
            update: { data: riskProfile },
          },
        },
      },
    });
    return true;
  }
}
