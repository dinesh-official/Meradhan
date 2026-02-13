import {
  db,
  type CustomersBankAccountModel,
  type CustomersDematAccountModel,
} from "@core/database/database";
import { NseCBRICS } from "@modules/RFQ/nse/nse_CBRICS";
import { getStateCode } from "@modules/RFQ/nse/values";
import {
  removeLastCommaChunks,
  splitAddressInto3BalancedLines,
} from "@packages/kyc-providers";
import { AppError } from "@utils/error/AppError";
import { removeCountryCode } from "@utils/filters/convert";

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
        aadhaarCard: true,
      },
    });

    if (!user) {
      throw new AppError("No User Found");
    }
    const dobDoi = user.aadhaarCard?.dateOfBirth?.replaceAll("/", "-") || "";

    const address = splitAddressInto3BalancedLines(
      removeLastCommaChunks(user.currentAddress!.fullAddress, 3),
    );

    console.log(
      user.dematAccounts.map((e) => {
        return {
          benId: e.clientId,
          dpType: e.depositoryName,
          dpId: e.depositoryName == "NSDL" ? e.dpId : undefined,
          isDefault: e.isPrimary ? "Y" : "N",
          status: "A",
        };
      }),
    );

    console.log(
      user.bankAccounts.map((e) => {
        return {
          bankAccountNo: e.accountNumber,
          bankIFSC: e.ifscCode,
          bankName: e.bankName,
          isDefault: e.isPrimary ? "Y" : "N",
          status: "A",
        };
      }),
    );

    const participant = await this.cbrics.unregisteredParticipant({
      address: address?.line1 || "",
      address2: address?.line2 || undefined,
      address3: address?.line3 || undefined,
      contactPerson: `${user.firstName} ${user.middleName} ${user.lastName}`,
      firstName: `${user.firstName} ${user.middleName} ${user.lastName}`,
      loginId: user.userName,
      mobileList: [removeCountryCode(user.phoneNo)],
      panNo: user.panCard!.panCardNo,
      emailList: [user.emailAddress],
      stateCode: getStateCode(user.currentAddress!.state)!,
      regAddress: user.currentAddress!.fullAddress,
      dobDoi: dobDoi,
      telephone: removeCountryCode(user.phoneNo),
      expiryDate: null,
      leiCode: null,
      custodian: null,
      bankAccountList: user.bankAccounts.map((e) => {
        return {
          bankAccountNo: e.accountNumber,
          bankIFSC: e.ifscCode,
          bankName: e.bankName,
          isDefault: e.isPrimary ? "Y" : "N",
          status: "A",
        };
      }),
      dpAccountList: user.dematAccounts.map((e) => {
        return {
          benId: e.clientId,
          dpType: e.depositoryName,
          dpId: e.depositoryName == "NSDL" ? e.dpId : undefined,
          isDefault: e.isPrimary ? "Y" : "N",
          status: "A",
        };
      }),
    });

    // save to our db
    const saveToMyDb = await db.dataBase.customerProfileDataModel.update({
      where: {
        id: user.id,
      },
      data: {
        nseDataSet: {
          create: {
            participant: {
              create: {
                actualStatus: participant.actualStatus,
                contactPerson: participant.contactPerson,
                custodian: participant.custodian,
                dobDoi: dobDoi,
                userId: userId,
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
                        workflowStatus: bank.workflowStatus,
                      };
                    }),
                  },
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
                        workflowStatus: dp.workflowStatus,
                      };
                    }),
                  },
                },
              },
            },
          },
        },
      },
      include: {
        nseDataSet: {
          include: {
            participant: true,
          },
        },
      },
    });

    return saveToMyDb.nseDataSet!.participant;
  }

  public async updateParticipant(userId: number) {
    // query data
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId },
      include: {
        panCard: true,
        currentAddress: true,
        bankAccounts: true,
        aadhaarCard: true,
        dematAccounts: true,
        nseDataSet: {
          select: {
            participant: {
              select: {
                id: true,
                bankAccountList: true,
                dpAccountList: true,
              },
            },
          },
        },
      },
    });
    if (!user) {
      throw new AppError("No User Found");
    }

    // send to cbrics
    const participant = await this.cbrics.updateUnregisteredParticipant({
      id: user.nseDataSet!.participant.id,
      address: user.currentAddress!.line1,
      address2: user.currentAddress?.line2 || undefined,
      address3: user.currentAddress?.line3 || undefined,
      contactPerson: `${user.firstName} ${user.middleName} ${user.lastName}`,
      firstName: `${user.firstName} ${user.middleName} ${user.lastName}`,
      mobileList: [removeCountryCode(user.phoneNo)],
      panNo: user.panCard!.panCardNo,
      emailList: [user.emailAddress],
      stateCode: getStateCode(user.currentAddress!.state)!,
      regAddress: user.currentAddress!.fullAddress,
      telephone: removeCountryCode(user.phoneNo),
      expiryDate: null,
      leiCode: null,
      custodian: null,
      dobDoi: user.aadhaarCard?.dateOfBirth?.replaceAll("/", "-") || "",
      bankAccountList: user.bankAccounts.map((e) => {
        return {
          bankAccountNo: e.accountNumber,
          bankIFSC: e.ifscCode,
          bankName: e.bankName,
          isDefault: e.isPrimary ? "Y" : "N",
          status: "A",
        };
      }),
      dpAccountList: user.dematAccounts.map((e) => {
        return {
          benId: e.clientId,
          dpType: e.depositoryName,
          dpId: e.dpId,
          isDefault: e.isPrimary ? "Y" : "N",
          status: "A",
        };
      }),
    });

    /// delete old nse Bank Accounts form local
    await db.dataBase.nSEBankAccount.deleteMany({
      where: {
        id: {
          in: user.nseDataSet?.participant.bankAccountList.map((e) => e.id),
        },
      },
    });

    /// delete old nse dp Accounts form local
    await db.dataBase.nSEDpAccount.deleteMany({
      where: {
        id: {
          in: user.nseDataSet?.participant.dpAccountList.map((e) => e.id),
        },
      },
    });

    // Auto Create New Bank And Dp account
    // save to our db
    const saveToMyDb = await db.dataBase.nseCbricsParticipantModel.update({
      where: {
        id: user.nseDataSet!.participant.id,
      },
      data: {
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
                workflowStatus: bank.workflowStatus,
              };
            }),
          },
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
                workflowStatus: dp.workflowStatus,
              };
            }),
          },
        },
      },
    });

    return saveToMyDb;
  }

  public async getAllParticipants() {
    return await this.cbrics.getAllUnregisteredParticipants({
      workflowStatus: 1,
    });
  }

  public async syncParticipant(userId: number) {
    // query data
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId },
      select: {
        nseDataSet: {
          select: {
            participant: {
              select: {
                id: true,
              },
              include: {
                bankAccountList: true,
                dpAccountList: true,
              },
            },
          },
        },
      },
    });
    if (!user?.nseDataSet?.participant.id) {
      throw new AppError("No participant Found");
    }

    // send to cbrics
    const participant = await this.cbrics.getUnregisteredParticipantById(
      user.nseDataSet.participant.id,
    );

    /// delete old nse Bank Accounts form local
    await db.dataBase.nSEBankAccount.deleteMany({
      where: {
        id: {
          in: user.nseDataSet?.participant.bankAccountList.map((e) => e.id),
        },
      },
    });

    /// delete old nse dp Accounts form local
    await db.dataBase.nSEDpAccount.deleteMany({
      where: {
        id: {
          in: user.nseDataSet?.participant.dpAccountList.map((e) => e.id),
        },
      },
    });

    // save to our db
    const updateToMyDb = await db.dataBase.nseCbricsParticipantModel.update({
      where: {
        id: user.nseDataSet.participant.id,
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
                workflowStatus: bank.workflowStatus,
              };
            }),
          },
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
                workflowStatus: dp.workflowStatus,
              };
            }),
          },
        },
      },
      include: {
        bankAccountList: true,
        dpAccountList: true,
      },
    });

    return updateToMyDb;
  }

  public async addBankAccount(
    userId: number,
    bank: {
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      isPrimary: boolean;
    },
  ) {
    // query data
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId },
      select: {
        nseDataSet: {
          select: {
            participant: {
              select: {
                id: true,
                loginId: true,
              },
            },
          },
        },
      },
    });
    if (!user?.nseDataSet?.participant.id) {
      throw new AppError("No participant Found");
    }

    const addedBank = await this.cbrics.addUnregisteredBankAccount({
      bankIFSC: bank.ifscCode,
      bankName: bank.bankName,
      isDefault: bank.isPrimary ? "Y" : "N",
      bankAccountNo: bank.accountNumber,
      participantCode: user.nseDataSet.participant.loginId,
    });

    await this.syncParticipant(userId);
    return addedBank;
  }

  public async setDefaultBankAccount(
    userId: number,
    bank: CustomersBankAccountModel,
  ) {
    // query data
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId },
      select: {
        nseDataSet: {
          select: {
            participant: {
              select: {
                id: true,
                loginId: true,
              },
            },
          },
        },
      },
    });
    if (!user?.nseDataSet?.participant.id) {
      throw new AppError("No participant Found");
    }
    const addedBank = await this.cbrics.markDefaultUnregisteredBankAccount({
      bankIFSC: bank.ifscCode,
      bankAccountNo: bank.accountNumber,
      participantCode: user.nseDataSet.participant.loginId,
    });
    await this.syncParticipant(userId);
    return addedBank;
  }

  public async deleteBankAccount(
    userId: number,
    bank: CustomersBankAccountModel,
  ) {
    // query data
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId },
      select: {
        nseDataSet: {
          select: {
            participant: {
              select: {
                id: true,
                loginId: true,
              },
            },
          },
        },
      },
    });
    if (!user?.nseDataSet?.participant.id) {
      throw new AppError("No participant Found");
    }
    const addedBank = await this.cbrics.updateUnregisteredBankAccountStatus({
      bankIFSC: bank.ifscCode,
      bankAccountNo: bank.accountNumber,
      participantCode: user.nseDataSet.participant.loginId,
      status: "D",
    });
    await this.syncParticipant(userId);
    return addedBank;
  }

  public async addDpAccount(
    userId: number,
    dpAccount: {
      clientId: string;
      dpType: "NSDL" | "CDSL";
      dpId?: string;
      isPrimary: boolean;
    },
  ) {
    // query data
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId },
      select: {
        nseDataSet: {
          select: {
            participant: {
              select: {
                id: true,
                loginId: true,
              },
            },
          },
        },
      },
    });
    if (!user?.nseDataSet?.participant.id) {
      throw new AppError("No participant Found");
    }

    const addedDpAccount = await this.cbrics.addUnregisteredDpAccount({
      participantCode: user.nseDataSet.participant.loginId,
      benId: dpAccount.clientId,
      dpType: dpAccount.dpType,
      isDefault: dpAccount.isPrimary ? "Y" : "N",
      dpId: dpAccount.dpId,
    });
    await this.syncParticipant(userId);
    return addedDpAccount;
  }

  public async setDefaultDpAccount(
    userId: number,
    dpAccount: CustomersDematAccountModel,
  ) {
    // query data
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId },
      select: {
        nseDataSet: {
          select: {
            participant: {
              select: {
                id: true,
                loginId: true,
              },
            },
          },
        },
      },
    });

    if (!user?.nseDataSet?.participant.id) {
      throw new AppError("No participant Found");
    }

    const addedDpAccount = await this.cbrics.markDefaultUnregisteredDpAccount({
      participantCode: user.nseDataSet.participant.loginId,
      benId: dpAccount.clientId,
      dpType: dpAccount.depositoryName,
      dpId: dpAccount.dpId,
    });
    await this.syncParticipant(userId);
    return addedDpAccount;
  }

  public async deleteDpAccount(
    userId: number,
    dpAccount: CustomersDematAccountModel,
  ) {
    // query data
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId },
      select: {
        nseDataSet: {
          select: {
            participant: {
              select: {
                id: true,
                loginId: true,
              },
            },
          },
        },
      },
    });

    if (!user?.nseDataSet?.participant.id) {
      throw new AppError("No participant Found");
    }

    const addedDpAccount = await this.cbrics.updateUnregisteredDpAccountStatus({
      participantCode: user.nseDataSet.participant.loginId,
      benId: dpAccount.clientId,
      dpType: dpAccount.depositoryName,
      dpId: dpAccount.dpId,
      status: "D",
    });
    await this.syncParticipant(userId);
    return addedDpAccount;
  }
}
