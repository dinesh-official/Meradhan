/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@core/database/database";
import type { appSchema } from "@root/schema";
import { ParticipantManager } from "@services/refq/nse/cbrics_manager.service";
import { AppError } from "@utils/error/AppError";
import type z from "zod";

const KYC_VERIFIED_REQUIRED_MSG =
  "You cannot add, update, or delete bank or demat accounts until your KYC is verified.";

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
    try {
      await this.cbricsManager.setDefaultBankAccount(customerId, bankAccount);
    } catch (error) {
      console.log(error);
    }
    // Set new primary account
    await db.dataBase.customersBankAccountModel.update({
      where: {
        id: bankAccountId,
      },
      data: {
        isPrimary: true,
      },
    });

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
    try {
      await this.cbricsManager.setDefaultDpAccount(customerId, dematAccount);
    } catch (error) {
      console.log(error);
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

    return true;
  }

  async saveRiskProfile(
    customerId: number,
    riskProfile: any[]
  ): Promise<boolean> {
    await db.dataBase.customerProfileDataModel.update({
      where: { id: customerId },
      data: {
        riskProfile: {
          update: {
            data: riskProfile,
          },
        },
      },
    });
    return true;
  }
}
