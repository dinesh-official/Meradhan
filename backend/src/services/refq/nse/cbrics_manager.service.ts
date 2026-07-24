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
} from "@root/kyc-providers";
import { AppError } from "@utils/error/AppError";
import { removeCountryCode } from "@utils/filters/convert";

/**
 * KRA numeric state / UT codes (API Download file format May 2025)
 * → state names used by `getStateCode()` (values.ts).
 * This is required because some existing DB records store state as numeric KRA codes.
 */


const KRA_STATE_CODE_TO_NAME: Record<string, string> = {
  "001": "Jammu and Kashmir",
  "002": "Himachal Pradesh",
  "003": "Punjab",
  "004": "Chandigarh",
  "005": "Uttarakhand",
  "006": "Haryana",
  "007": "Delhi",
  "008": "Rajasthan",
  "009": "Uttar Pradesh",
  "010": "Bihar",
  "011": "Sikkim",
  "012": "Arunachal Pradesh",
  "013": "Assam",
  "014": "Manipur",
  "015": "Mizoram",
  "016": "Tripura",
  "017": "Meghalaya",
  "018": "Nagaland",
  "019": "West Bengal",
  "020": "Jharkhand",
  "021": "Odisha",
  "022": "Chhattisgarh",
  "023": "Madhya Pradesh",
  "024": "Gujarat",
  "025": "Daman & Diu",
  "026": "Dadra and Nagar Haveli",
  "027": "Maharashtra",
  "028": "Andhra Pradesh",
  "029": "Karnataka",
  "030": "Goa",
  "031": "Lakshadweep",
  "032": "Kerala",
  "033": "Tamil Nadu",
  "034": "Puducherry",
  "035": "Andaman & Nicobar Islands",
  "036": "Ladakh",
  "037": "Telangana",
  "099": "IMPORT (Not Registered in India)",
};

function kraStateCodeToName(code: string | null | undefined): string {
  const raw = code == null ? "" : String(code).trim();
  if (!raw) return raw;
  if (/^\d+$/.test(raw)) {
    const key = String(parseInt(raw, 10)).padStart(3, "0");
    return KRA_STATE_CODE_TO_NAME[key] ?? raw;
  }
  return raw;
}

export class ParticipantManager {
  private cbrics: NseCBRICS;

  constructor() {
    this.cbrics = new NseCBRICS();
  }

  /**
   * Corporate participant registration using Corporate KYC table (QC form) data.
   *
   * This is intentionally separate from `registerParticipant()` (individual flow)
   * so we don't disturb existing behaviour.
   */
  public async registerCorporateParticipantFromCorporateKyc(userId: number) {
    const user = await db.dataBase.customerProfileDataModel.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("Customer not found", {
        code: "CUSTOMER_NOT_FOUND",
        statusCode: 404,
      });
    }
    const corporateKyc = await db.dataBase.corporateKycModel.findUnique({
      where: { customerProfileDataModelId: userId },
      include: {
        bankAccounts: true,
        dematAccounts: true,
        authorisedSignatories: true,
      },
    });

    if (!corporateKyc) {
      throw new AppError("Corporate KYC not found", {
        code: "CORPORATE_KYC_NOT_FOUND",
        statusCode: 404,
      });
    }

    if (!(corporateKyc.bankAccounts ?? []).length) {
      throw new AppError(
        "Corporate KYC has no bank accounts — cannot register on CBRICS without bankAccountList.",
        {
          code: "CBRICS_CORPORATE_BANKS_REQUIRED",
          statusCode: 400,
        },
      );
    }

    if (!(corporateKyc.dematAccounts ?? []).length) {
      throw new AppError(
        "Corporate KYC has no demat accounts — cannot register on CBRICS without dpAccountList.",
        {
          code: "CBRICS_CORPORATE_DEMATS_REQUIRED",
          statusCode: 400,
        },
      );
    }

    const signatory = corporateKyc.authorisedSignatories?.[0];
    const contactPerson =
      signatory?.fullName?.trim() ||
      corporateKyc.entityName?.trim() ||
      "CORPORATE";

    // CBRICS contact channel = customer's signup profile (same as KRA's
    // APP_EMAIL / APP_MOB_NO). The authorised signatory's contact is kept
    // for APP_ADDL_DATA + e-sign workflows but is not surfaced to CBRICS.
    // Fall back to the signatory only when the profile is somehow blank
    // (shouldn't happen — `emailAddress` is non-nullable in the schema).
    const email = (user.emailAddress ?? signatory?.email ?? "").trim();
    const mobile = (user.phoneNo ?? signatory?.mobile ?? "").trim();

    const fullAddress =
      corporateKyc.registeredFullAddress?.trim() ||
      corporateKyc.correspondenceFullAddress?.trim() ||
      [
        corporateKyc.registeredLine1,
        corporateKyc.registeredLine2,
        corporateKyc.registeredLine3,
        corporateKyc.registeredCity,
        corporateKyc.registeredDistrict,
        corporateKyc.registeredState,
        corporateKyc.registeredPinCode,
      ]
        .filter(Boolean)
        .join(", ");

    const address = splitAddressInto3BalancedLines(
      removeLastCommaChunks(fullAddress, 3),
    );

    const stateRaw =
      corporateKyc.registeredState?.trim() ||
      corporateKyc.correspondenceState?.trim() ||
      "";
    const stateNameForCb = kraStateCodeToName(stateRaw);
    const stateCode =
      getStateCode(stateNameForCb) ??
      getStateCode("IMPORT (Not Registered in India)");

    if (!stateCode) {
      throw new AppError("State Code cannot be empty.", {
        code: "CBRICS_STATE_CODE_EMPTY",
        statusCode: 400,
      });
    }

    const dobDoi = corporateKyc.dateOfIncorporation
      ? corporateKyc.dateOfIncorporation.toISOString().slice(0, 10).split("-").reverse().join("-")
      : "";

    const participant = await this.cbrics.unregisteredParticipant({
      address: address?.line1 || "",
      address2: address?.line2 || undefined,
      address3: address?.line3 || undefined,
      contactPerson,
      firstName: corporateKyc.entityName,
      loginId: user?.userName ?? "",
      mobileList: mobile ? [removeCountryCode(mobile)] : [],
      panNo: corporateKyc.panNumber ?? "",
      emailList: email ? [email] : [],
      stateCode: stateCode,
      regAddress: fullAddress,
      dobDoi,
      telephone: mobile ? removeCountryCode(mobile) : "",
      expiryDate: null,
      leiCode: null,
      custodian: null,
      bankAccountList: (corporateKyc.bankAccounts ?? []).map((e) => {
        return {
          bankAccountNo: e.accountNumber,
          bankIFSC: e.ifscCode,
          bankName: e.bankName,
          isDefault: e.isPrimaryAccount ? "Y" : "N",
          status: "A",
        };
      }),
      dpAccountList: (corporateKyc.dematAccounts ?? []).map((e) => {
        return {
          benId: e.clientId,
          dpType: e.depository,
          dpId: e.depository == "NSDL" ? e.dpId : undefined,
          isDefault: e.isPrimary ? "Y" : "N",
          status: "A",
        };
      }),
    });

    const saveToMyDb = await db.dataBase.customerProfileDataModel.update({
      where: { id: userId },
      data: {
        nseDataSet: {
          create: {
            participant: {
              create: {
                actualStatus: participant.actualStatus,
                contactPerson: participant.contactPerson,
                custodian: participant.custodian,
                dobDoi: participant.dobDoi,
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

  /**
   * Push corporate KYC bank accounts that are missing on NSE CBRICS
   * (`POST /unreg/bankacc`). No-op when the customer has no CBRICS
   * participant yet. Used after Verify & Activate and after corporate KYC
   * bank saves so profile/local banks are not the only place banks land.
   */
  public async syncCorporateKycBanksToCbrics(userId: number): Promise<{
    added: number;
    skipped: number;
    errors: string[];
    participantCode: string | null;
  }> {
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId },
      select: {
        nseDataSet: {
          select: {
            participant: {
              select: {
                id: true,
                loginId: true,
                bankAccountList: {
                  select: {
                    bankAccountNo: true,
                    bankIFSC: true,
                  },
                },
              },
            },
          },
        },
        corporateKyc: {
          select: {
            bankAccounts: {
              select: {
                accountNumber: true,
                ifscCode: true,
                bankName: true,
                isPrimaryAccount: true,
              },
            },
          },
        },
      },
    });

    const participant = user?.nseDataSet?.participant;
    if (!participant?.loginId) {
      return {
        added: 0,
        skipped: 0,
        errors: [],
        participantCode: null,
      };
    }

    const corporateBanks = user?.corporateKyc?.bankAccounts ?? [];
    if (corporateBanks.length === 0) {
      return {
        added: 0,
        skipped: 0,
        errors: [],
        participantCode: participant.loginId,
      };
    }

    const existingKeys = new Set(
      (participant.bankAccountList ?? []).map(
        (b) =>
          `${String(b.bankAccountNo ?? "")
            .trim()
            .toUpperCase()}|${String(b.bankIFSC ?? "")
            .trim()
            .toUpperCase()}`,
      ),
    );

    let added = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const bank of corporateBanks) {
      const accountNumber = String(bank.accountNumber ?? "").trim();
      const ifscCode = String(bank.ifscCode ?? "").trim();
      const bankName = String(bank.bankName ?? "").trim();
      if (!accountNumber || !ifscCode || !bankName) {
        errors.push(
          `Skipped incomplete bank row (account/IFSC/name required): ${accountNumber || "(no acct)"}`,
        );
        continue;
      }

      const key = `${accountNumber.toUpperCase()}|${ifscCode.toUpperCase()}`;
      if (existingKeys.has(key)) {
        skipped += 1;
        continue;
      }

      try {
        await this.addBankAccount(userId, {
          accountNumber,
          ifscCode,
          bankName,
          isPrimary: Boolean(bank.isPrimaryAccount),
        });
        existingKeys.add(key);
        added += 1;
      } catch (err) {
        const message =
          err instanceof AppError
            ? err.message
            : err instanceof Error
              ? err.message
              : String(err);
        errors.push(`${accountNumber}: ${message}`);
      }
    }

    return {
      added,
      skipped,
      errors,
      participantCode: participant.loginId,
    };
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
    const dobDoi = user.panCard?.dateOfBirth?.replaceAll("/", "-").split("-").reverse().join("-") || "";

    const address = splitAddressInto3BalancedLines(
      removeLastCommaChunks(user.currentAddress!.fullAddress, 3),
    );

    const stateNameForCb = kraStateCodeToName(user.currentAddress!.state);
    const stateCode =
      getStateCode(stateNameForCb) ??
      getStateCode("IMPORT (Not Registered in India)");

    if (!stateCode) {
      throw new AppError("State Code cannot be empty.", {
        code: "CBRICS_STATE_CODE_EMPTY",
        statusCode: 400,
      });
    }

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
      stateCode: stateCode,
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

    const stateNameForCb = kraStateCodeToName(user.currentAddress!.state);
    const stateCode =
      getStateCode(stateNameForCb) ??
      getStateCode("IMPORT (Not Registered in India)");

    if (!stateCode) {
      throw new AppError("State Code cannot be empty.", {
        code: "CBRICS_STATE_CODE_EMPTY",
        statusCode: 400,
      });
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
      stateCode: stateCode,
      regAddress: user.currentAddress!.fullAddress,
      telephone: removeCountryCode(user.phoneNo),
      expiryDate: null,
      leiCode: null,
      custodian: null,
      dobDoi: user.panCard?.dateOfBirth?.replaceAll("/", "-") || "",
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
                bankAccountList: {
                  select: { id: true },
                },
                dpAccountList: {
                  select: { id: true },
                },
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
