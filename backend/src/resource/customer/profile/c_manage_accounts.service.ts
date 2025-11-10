import { db } from "@core/database/database";
import type { appSchema } from "@root/schema";
import { AppError } from "@utils/error/AppError";
import type z from "zod";

export class CustomerManageAccountsService {

    async addBankAccount(customerId: number, bankDetails: z.infer<typeof appSchema.kyc.bankInfoSchema>): Promise<boolean> {
        const existingAccount = await db.dataBase.customerProfileDataModel.findFirst({
            where: {
                id: customerId,
                bankAccounts: {
                    some: {
                        accountNumber: bankDetails.accountNumber,
                        ifscCode: bankDetails.ifscCode
                    }
                }
            }
        });

        if (existingAccount) {
            throw new AppError("Bank account already exists.");
        }

        // unselct existing primary accounts
        if (bankDetails.isDefault) {
            await db.dataBase.customersBankAccountModel.updateMany({
                where: {
                    customerProfileDataModelId: customerId,
                    isPrimary: true
                },
                data: {
                    isPrimary: false
                }
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
                    }
                }
            }
        });

        return true;
    }

    async removeBankAccount(customerId: number, bankAccountId: number): Promise<boolean> {
        const bankAccount = await db.dataBase.customersBankAccountModel.findFirst({
            where: {
                id: bankAccountId,
                customerProfileDataModelId: customerId
            }
        });

        if (!bankAccount) {
            throw new AppError("Bank account not found.");
        }

        if (bankAccount.isPrimary) {
            throw new AppError("Cannot remove the primary bank account.");
        }

        await db.dataBase.customersBankAccountModel.delete({
            where: {
                id: bankAccountId
            }
        });

        return true;
    }

    async setPrimaryBankAccount(customerId: number, bankAccountId: number): Promise<boolean> {
        const bankAccount = await db.dataBase.customersBankAccountModel.findFirst({
            where: {
                id: bankAccountId,
                customerProfileDataModelId: customerId
            }
        });

        if (!bankAccount) {
            throw new AppError("Bank account not found.");
        }

        // Unset existing primary account
        await db.dataBase.customersBankAccountModel.updateMany({
            where: {
                customerProfileDataModelId: customerId,
                isPrimary: true
            },
            data: {
                isPrimary: false
            }
        });

        // Set new primary account
        await db.dataBase.customersBankAccountModel.update({
            where: {
                id: bankAccountId
            },
            data: {
                isPrimary: true
            }
        });

        return true;
    }

    async addNewDematAccount(customerId: number, dematDetails: z.infer<typeof appSchema.customer.createDematAccountSchema>): Promise<boolean> {
        const existingAccount = await db.dataBase.customerProfileDataModel.findFirst({
            where: {
                id: customerId,
                dematAccounts: {
                    some: {
                        clientId: dematDetails.clientId
                    }
                }
            }
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
                        

                    }
                }
            }
        });

        return true;
    }

    async removeDematAccount(customerId: number, dematAccountId: number): Promise<boolean> {
        const dematAccount = await db.dataBase.customersDematAccountModel.findFirst({
            where: {
                id: dematAccountId,
                customerProfileDataModelId: customerId
            }
        });

        if (!dematAccount) {
            throw new AppError("Demat account not found.");
        }

        if (dematAccount.isPrimary) {
            throw new AppError("Cannot remove the primary demat account.");
        }

        await db.dataBase.customersDematAccountModel.delete({
            where: {
                id: dematAccountId
            }
        });

        return true;
    }

    async setPrimaryDematAccount(customerId: number, dematAccountId: number): Promise<boolean> {
        const dematAccount = await db.dataBase.customersDematAccountModel.findFirst({
            where: {
                id: dematAccountId,
                customerProfileDataModelId: customerId
            }
        });

        if (!dematAccount) {
            throw new AppError("Demat account not found.");
        }

        if (dematAccount.isPrimary) {
            throw new AppError("Cannot set the primary demat account as primary again.");
        }

        // Unset existing primary account
        await db.dataBase.customersDematAccountModel.updateMany({
            where: {
                customerProfileDataModelId: customerId,
                isPrimary: true
            },
            data: {
                isPrimary: false
            }
        });

        // Set new primary account
        await db.dataBase.customersDematAccountModel.update({
            where: {
                id: dematAccountId
            },
            data: {
                isPrimary: true
            }
        });

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async saveRiskProfile(customerId: number, riskProfile: any[]): Promise<boolean> {
        await db.dataBase.customerProfileDataModel.update({
            where: { id: customerId },
            data: {
                riskProfile: {
                    update: {
                        data: riskProfile
                    }
                }
            }
        });
        return true;
    }

}