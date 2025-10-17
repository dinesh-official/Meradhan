import { db, type CustomersBankAccountModel, type CustomersDematAccountModel } from "@core/database/database";
import { NseCBRICS } from "@lib/provider/RFQ/nse/NseCBRICS";
import { getStateCode } from "@lib/provider/RFQ/nse/values";
import { AppError } from "@utils/error/AppError";

export class ParticipantManager {

    private cbrics: NseCBRICS;

    constructor() {
        this.cbrics = new NseCBRICS();
    }

    public async registerParticipant(userId: number) {
        // query data
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: { id: userId },
            include: {
                panCard: true,
                currentAddress: true,
                bankAccounts: true,
                dematAccounts: true,
            }
        });
        if (!user) {
            throw new AppError("No User Found");
        }

        // send to cbrics
        const participant = await this.cbrics.unregisteredParticipant({
            address: user.currentAddress!.line1,
            address2: user.currentAddress?.line2 || undefined,
            address3: user.currentAddress?.line3 || undefined,
            contactPerson: `${user.firstName} ${user.middleName} ${user.lastName}`,
            firstName: `${user.firstName} ${user.middleName} ${user.lastName}`,
            loginId: user.userName,
            mobileList: [user.middleName],
            panNo: user.panCard!.panCardNo,
            emailList: [user.emailAddress],
            stateCode: getStateCode(user.currentAddress!.state)!,
            regAddress: user.currentAddress!.fullAddress,
            telephone: user.phoneNo,
            expiryDate: null,
            leiCode: null,
            custodian: null,
            bankAccountList: user.bankAccounts.map((e) => {
                return {
                    bankAccountNo: e.accountNumber,
                    bankIFSC: e.ifscCode,
                    bankName: e.bankName,
                    isDefault: e.isPrimary ? "Y" : "N",
                }
            }),
            dpAccountList: user.dematAccounts.map((e) => {
                return {
                    benId: e.clientId,
                    dpType: e.depositoryName,
                    dpId: e.dpId,
                    isDefault: e.isPrimary ? "Y" : "N",
                }
            }),
        });


        // save to our db 
        const saveToMyDb = await db.dataBase.customerProfileDataModel.update({
            where: {
                id: user.id
            },
            data: {
                nse: {
                    create: {
                        participant: {
                            create: {
                                actualStatus: participant.actualStatus,
                                contactPerson: participant.contactPerson,
                                custodian: participant.custodian,

                                firstName: participant.firstName,
                                id: participant.id,
                                loginId: participant.loginId,
                                panNo: participant.panNo,
                                regAddress: participant.regAddress,
                                stateCode: participant.stateCode,
                                telephone: participant.telephone,
                                workflowStatus: participant.workflowStatus,
                                address: participant.address,
                                address2: participant.address2,
                                address3: participant.address3,
                                emailList: participant.emailList,
                                expiryDate: participant.expiryDate,
                                fax: participant.fax,
                                leiCode: participant.leiCode,
                                mobileList: participant.mobileList,
                                panVerRemarks: participant.panVerRemarks,
                                panVerStatus: participant.panVerStatus,
                                remarks: participant.remarks,
                                bankAccountList: {
                                    createMany: {
                                        data: participant.bankAccountList.map((bank) => {
                                            return {
                                                bankAccountNo: bank.bankAccountNo!,
                                                bankIFSC: bank.bankIFSC,
                                                bankName: bank.bankName,
                                                isDefault: bank.isDefault,
                                                status: bank.status,
                                                workflowStatus: bank.workflowStatus
                                            }
                                        })
                                    }
                                },
                                dpAccountList: {
                                    createMany: {
                                        data: participant.dpAccountList.map((dp) => {
                                            return {
                                                benId: dp.benId,
                                                dpType: dp.dpType,
                                                dpId: dp.dpId,
                                                isDefault: dp.isDefault,
                                                status: dp.status,
                                                workflowStatus: dp.workflowStatus
                                            }
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            },
            include: {
                nse: {
                    include: {
                        participant: true
                    }
                }
            }

        })

        return saveToMyDb.nse!.participant;
    }

    public async syncParticipant(userId: number) {
        // query data
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: { id: userId },
            select: {
                nse: {
                    select: {
                        participant: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }

        });
        if (!user?.nse?.participant.id) {
            throw new AppError("No participant Found");
        }

        // send to cbrics
        const participant = await this.cbrics.getUnregisteredParticipantById(user.nse.participant.id);


        // save to our db 
        const updateToMyDb = await db.dataBase.nSECbricsParticipantModel.update({
            where: {
                id: user.nse.participant.id
            },
            data: {
                actualStatus: participant.actualStatus,
                contactPerson: participant.contactPerson,
                custodian: participant.custodian,
                firstName: participant.firstName,
                loginId: participant.loginId,
                panNo: participant.panNo,
                regAddress: participant.regAddress,
                stateCode: participant.stateCode,
                telephone: participant.telephone,
                workflowStatus: participant.workflowStatus,
                address: participant.address,
                address2: participant.address2,
                address3: participant.address3,
                emailList: participant.emailList,
                expiryDate: participant.expiryDate,
                fax: participant.fax,
                leiCode: participant.leiCode,
                mobileList: participant.mobileList,
                panVerRemarks: participant.panVerRemarks,
                panVerStatus: participant.panVerStatus,
                remarks: participant.remarks,
                bankAccountList: {
                    createMany: {
                        data: participant.bankAccountList.map((bank) => {
                            return {
                                bankAccountNo: bank.bankAccountNo!,
                                bankIFSC: bank.bankIFSC,
                                bankName: bank.bankName,
                                isDefault: bank.isDefault,
                                status: bank.status,
                                workflowStatus: bank.workflowStatus
                            }
                        })
                    }
                },
                dpAccountList: {
                    createMany: {
                        data: participant.dpAccountList.map((dp) => {
                            return {
                                benId: dp.benId,
                                dpType: dp.dpType,
                                dpId: dp.dpId,
                                isDefault: dp.isDefault,
                                status: dp.status,
                                workflowStatus: dp.workflowStatus
                            }
                        })
                    }
                }
            },
            include: {
                bankAccountList: true,
                dpAccountList: true,
            }
        })

        return updateToMyDb;
    }

    public async addBankAccount(userId: number, bank: CustomersBankAccountModel) {
        // query data
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: { id: userId },
            select: {
                nse: {
                    select: {
                        participant: {
                            select: {
                                id: true,
                                loginId: true,
                            }
                        }
                    }
                }
            }

        });
        if (!user?.nse?.participant.id) {
            throw new AppError("No participant Found");
        }
        const addedBank = await this.cbrics.addUnregisteredBankAccount({
            bankIFSC: bank.ifscCode,
            bankName: bank.bankName,
            isDefault: bank.isPrimary ? "Y" : "N",
            bankAccountNo: bank.accountNumber,
            participantCode: user.nse.participant.loginId,
        })
        await this.syncParticipant(userId);
        return addedBank;
    }

    public async setDefaultBankAccount(userId: number, bank: CustomersBankAccountModel) {
        // query data
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: { id: userId },
            select: {
                nse: {
                    select: {
                        participant: {
                            select: {
                                id: true,
                                loginId: true,
                            }
                        }
                    }
                }
            }

        });
        if (!user?.nse?.participant.id) {
            throw new AppError("No participant Found");
        }
        const addedBank = await this.cbrics.markDefaultUnregisteredBankAccount({
            bankIFSC: bank.ifscCode,
            bankAccountNo: bank.accountNumber,
            participantCode: user.nse.participant.loginId,
        })
        await this.syncParticipant(userId);
        return addedBank;
    }

    public async deleteBankAccount(userId: number, bank: CustomersBankAccountModel) {
        // query data
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: { id: userId },
            select: {
                nse: {
                    select: {
                        participant: {
                            select: {
                                id: true,
                                loginId: true,
                            }
                        }
                    }
                }
            }

        });
        if (!user?.nse?.participant.id) {
            throw new AppError("No participant Found");
        }
        const addedBank = await this.cbrics.updateUnregisteredBankAccountStatus({
            bankIFSC: bank.ifscCode,
            bankAccountNo: bank.accountNumber,
            participantCode: user.nse.participant.loginId,
            status: "D"
        })
        await this.syncParticipant(userId);
        return addedBank;
    }

    public async addDpAccount(userId: number, dpAccount: CustomersDematAccountModel) {
        // query data
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: { id: userId },
            select: {
                nse: {
                    select: {
                        participant: {
                            select: {
                                id: true,
                                loginId: true,
                            }
                        }
                    }
                }
            }

        });
        if (!user?.nse?.participant.id) {
            throw new AppError("No participant Found");
        }

        const addedDpAccount = await this.cbrics.addUnregisteredDpAccount({
            participantCode: user.nse.participant.loginId,
            benId: dpAccount.clientId,
            dpType: dpAccount.depositoryName,
            isDefault: dpAccount.isPrimary ? "Y" : "N",
            dpId: dpAccount.dpId
        })
        await this.syncParticipant(userId);
        return addedDpAccount;

    }

    public async setDefaultDpAccount(userId: number, dpAccount: CustomersDematAccountModel) {
        // query data
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: { id: userId },
            select: {
                nse: {
                    select: {
                        participant: {
                            select: {
                                id: true,
                                loginId: true,
                            }
                        }
                    }
                }
            }

        });

        if (!user?.nse?.participant.id) {
            throw new AppError("No participant Found");
        }

        const addedDpAccount = await this.cbrics.markDefaultUnregisteredDpAccount({
            participantCode: user.nse.participant.loginId,
            benId: dpAccount.clientId,
            dpType: dpAccount.depositoryName,
            dpId: dpAccount.dpId,
        })
        await this.syncParticipant(userId);
        return addedDpAccount;
    }

    public async deleteDpAccount(userId: number, dpAccount: CustomersDematAccountModel) {
        // query data
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: { id: userId },
            select: {
                nse: {
                    select: {
                        participant: {
                            select: {
                                id: true,
                                loginId: true,
                            }
                        }
                    }
                }
            }

        });

        if (!user?.nse?.participant.id) {
            throw new AppError("No participant Found");
        }

        const addedDpAccount = await this.cbrics.updateUnregisteredDpAccountStatus({
            participantCode: user.nse.participant.loginId,
            benId: dpAccount.clientId,
            dpType: dpAccount.depositoryName,
            dpId: dpAccount.dpId,
            status: "D"
        })
        await this.syncParticipant(userId);
        return addedDpAccount;
    }

}