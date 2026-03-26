import { db } from "@core/database/database";
import {
  addCompleteCustomerKycProfile,
  addKraWorkerJob,
} from "@jobs/kra_worker/kraWroker.helper";
import { appSchema } from "@root/schema";
import { AppError } from "@utils/error/AppError";
import { makeFullname } from "@utils/generate/generate_username";
import type z from "zod";
import { KycProvider } from "./kyc_provider";
import { KraSDK, type T_APP_PAN_INQ_DOWNLOAD } from "@packages/kyc-providers";
import { env } from "@packages/config/src/env";
import { checkKraProcessCheckStatus } from "@jobs/kra_worker/CheckKraStatus";

export class CustomerKycKycService {
  private kraSdk = new KraSDK({
    okraCdOrMiId: env.KRA_OKRA_CD_MI_ID,
    passKey: env.KRA_PASS_KEY,
    password: env.KRA_PASSWORD,
    userName: env.KRA_USERNAME,
    env: env.KRA_ENV,
  });
  private kycProvider = new KycProvider();

  async verifyPanInfo(data: z.infer<typeof appSchema.kyc.panVerifyInfoSchema>) {
    const response = await this.kycProvider.panVerifyInfo({
      date: data.dob,
      name: data.name,
      id: data.id,
    });
    return response;
  }

  // pan verify request
  async createPanVerifyRequest({
    id,
    data,
  }: {
    id: number;
    data: z.infer<typeof appSchema.kyc.kycPanInfoDataSchema>;
  }) {
    const { firstName, lastName, middleName } = data;
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError("User profile Not Found", {
        code: "USER_NOT_FOUND",
        statusCode: 404,
      });
    }

    const fullName = makeFullname({ firstName, middleName, lastName });
    const panDetails = await this.kycProvider.panVerifyInfo({
      date: data.dateOfBirth,
      id: data.panCardNo,
      name: fullName,
    });
    return panDetails;
  }

  // pan verify response
  async verifyPanResponse({ kid }: { kid: string }) {
    const panDetails = await this.kycProvider.verifyPan({ kid: kid });
    return panDetails;
  }

  // aadhaar verify request
  async createAadhaarVerifyRequest({
    id,
    data,
  }: {
    id: number;
    data: z.infer<typeof appSchema.kyc.kycAadhaarInfoDataSchema>;
  }) {
    try {
      const { firstName, lastName, middleName } = data;
      const user = await db.dataBase.customerProfileDataModel.findUnique({
        where: { id },
      });

      if (!user) {
        throw new AppError("User profile Not Found", {
          code: "USER_NOT_FOUND",
          statusCode: 404,
        });
      }

      const fullName = makeFullname({ firstName, middleName, lastName });
      const aadhaarDetails = await this.kycProvider.createAadhaarVerifyRequest({
        email: data.email,
        name: fullName,
      });
      return aadhaarDetails;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // get pan aadhar document files
  async getPanAadharDocumentFiles(kid: string, userName?: string) {
    const bytes = await this.kycProvider.getMediaFileDataBytes(kid);
    const files = await this.kycProvider.getPanAadharDocumentFiles(
      bytes,
      userName,
    );
    return files;
  }

  // aadhar profile image
  async getAadharProfileImage(imageString: string, userName?: string) {
    const files = await this.kycProvider.getBash64File(imageString, {
      name: "profile.png",
      path: `${userName ? userName + "/" : ""}kyc`,
    });
    return files;
  }

  // selfie verify
  async createSelfieVerifyRequest({
    id,
    data,
  }: {
    id: number;
    data: z.infer<typeof appSchema.kyc.selfieSignRequestSchema>;
  }) {
    const { firstName, lastName, middleName } = data;
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new AppError("User profile Not Found", {
        code: "USER_NOT_FOUND",
        statusCode: 404,
      });
    }
    const fullName = makeFullname({ firstName, middleName, lastName });
    const selfieDetails = await this.kycProvider.createSelfieVerifyRequest({
      email: user?.emailAddress,
      id: user?.userName,
      name: fullName,
    });
    return selfieDetails;
  }

  // selfie verify response
  async verifySelfieResponse({
    kid,
    userName,
  }: {
    kid: string;
    userName?: string;
  }) {
    const selfieDetails = await this.kycProvider.verifySelfie({ kid: kid });
    if (!selfieDetails.actions[0]?.file_id) {
      throw new AppError("User profile Not Found", {
        code: "USER_NOT_FOUND",
        statusCode: 404,
      });
    }
    const bytes = await this.kycProvider.getMediaFileDataBytes(
      selfieDetails.actions[0]?.file_id,
    );
    const image = await this.kycProvider.getBash64File(bytes, {
      name: "selfie.jpeg",
      path: `${userName ? userName + "/" : ""}kyc`,
    });
    selfieDetails.file_url = image;

    return selfieDetails;
  }

  // sign verify
  async createSignVerifyRequest({
    id,
    data,
  }: {
    id: number;
    data: z.infer<typeof appSchema.kyc.selfieSignRequestSchema>;
  }) {
    const { firstName, lastName, middleName } = data;
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new AppError("User profile Not Found", {
        code: "USER_NOT_FOUND",
        statusCode: 404,
      });
    }
    const fullName = makeFullname({ firstName, middleName, lastName });
    const selfieDetails = await this.kycProvider.createSignVerifyRequest({
      email: user?.emailAddress,
      id: user?.userName,
      name: fullName,
    });
    return selfieDetails;
  }

  // sign verify response
  async verifySignResponse({
    kid,
    userName,
  }: {
    kid: string;
    userName?: string;
  }) {
    const selfieDetails = await this.kycProvider.verifySign({ kid: kid });
    if (!selfieDetails.actions[0]?.file_id) {
      throw new AppError("User profile Not Found", {
        code: "USER_NOT_FOUND",
        statusCode: 404,
      });
    }
    const bytes = await this.kycProvider.getMediaFileDataBytes(
      selfieDetails.actions[0]?.file_id,
    );
    const image = await this.kycProvider.getBash64File(bytes, {
      name: "sign.jpeg",
      path: `${userName ? userName + "/" : ""}kyc/sign`,
    });
    selfieDetails.file_url = image;

    return selfieDetails;
  }

  // fetch ifsc info
  async fetchIfscInfo(ifsc: string) {
    const ifscCodes = await this.kycProvider.fetchIfscInfo(ifsc);
    return ifscCodes;
  }

  // verify bank account
  async verifyBankAccount(
    payload: z.infer<typeof appSchema.kyc.bankInfoSchema>,
  ) {
    const bankDetails = await this.kycProvider.verifyBankAccount({
      beneficiary_account_no: payload.accountNumber,
      beneficiary_ifsc: payload.ifscCode,
      beneficiary_name: payload.beneficiary_name,
    });
    return bankDetails;
  }

  // verify demat account
  async verifyDematAccount(
    payload: z.infer<typeof appSchema.kyc.dpAccountInfoSchema>,
  ) {
    const getPans = () => {
      const pans = payload.panNumber;
      let dataPan: {
        pan1: string;
        pan2?: string;
        pan3?: string;
      };

      dataPan = {
        pan1: pans[0]!,
      };

      if (pans?.[1]) {
        dataPan = {
          ...dataPan,
          pan2: pans[1],
        };
      }

      if (pans?.[2]) {
        dataPan = {
          ...dataPan,
          pan3: pans[2],
        };
      }
      return dataPan;
    };

    const pans = getPans();

    const dematDetails = await this.kycProvider.verifyDmateAccount(
      payload.depositoryName,
      {
        dpId: payload.dpId,
        boId_or_clientId: payload.beneficiaryClientId,
        ...pans,
      },
    );
    return dematDetails;
  }

  // e-sign request
  async reqEsignPdf(userID: number) {
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userID },
      select: { emailAddress: true },
    });
    if (!user) {
      throw new AppError("User Not Found");
    }
    const kycData = await db.dataBase.kYC_FLOW.findFirst({
      where: { userID },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const panData = ((kycData?.data as any)?.["step_1"] as any)?.["pan"] as any;
    if (!panData) {
      throw new AppError("not eligible for e-sign");
    }

    const fullName = makeFullname({
      firstName: panData?.["firstName"],
      middleName: panData?.["middleName"],
      lastName: panData?.["lastName"],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step1 = (kycData?.data as any)?.step_1 as any;
    const useKraKyc = Boolean(step1?.usedExistingKra && step1?.kraResponse);

    return await this.kycProvider.esignRequest({
      email: user.emailAddress,
      name: fullName,
      userId: userID,
      useKraKyc,
    });
  }

  // download esign pdf
  async downloadEsignPdf(
    document_id: string,
    customerId: number,
    userName?: string,
  ) {
    const pdfUrl = await this.kycProvider.getEsignPdf(document_id, userName);
    // set kyc status
    const store = await db.dataBase.kYC_FLOW.findFirst({
      where: { userID: customerId },
    });

    await db.dataBase.customerProfileDataModel.update({
      where: {
        id: Number(customerId),
      },
      data: {
        kycStatus: "UNDER_REVIEW",
        kycSubmitDate: new Date(),
      },
    });
    await addCompleteCustomerKycProfile(customerId);
    // Start KRa Process
    await addKraWorkerJob(
      {
        customerId: customerId,
        kycDataStoreId: store!.id,
        stage: "ENQUIRY_KRA",
        data: {
          currentStepName: store?.currentStepName,
        },
      },
      5 * 60 * 1000,
    );
    return pdfUrl;
  }

  async getKycLevel(id: number) {
    const steps = [
      "Identity Validation",
      "Personal Details",
      "Bank Account",
      "Demat Account",
      "Risk Profiling",
      "e-Signature",
      "100%",
    ];

    const kycData = await db.dataBase.kYC_FLOW.findFirst({
      where: { userID: id },
    });

    if (!kycData) {
      return "Not Started";
    }

    if (kycData.step) {
      return steps[kycData.step - 1] || "Unknown";
    }
    return "Unknown";
  }

  async downloadKycPdf(userId: number) {
    return await this.kycProvider.getKycPdfFile(userId);
  }

  async createKraVerifyRequest(userId: number, {
    pan,
    dob,
  }: {
    pan: string;
    dob: string;
  }) {


    const [day, month, year] = dob.split("-");
    const formatedDob = `${year}-${month}-${day}`;

    console.log({
      pan,
      dob,
      formatedDob
    });


    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new AppError("User Not Found", {
        code: "USER_NOT_FOUND",
        statusCode: 404,
      });
    }


    const kraDetails = await this.kraSdk.panInquiryTwo({
      pan: pan,
      dob: formatedDob,
      mobile: env.KRA_MOB_NO,
      reqNo: new Date().getTime().toString(),
    });



    console.log("KRA Details", JSON.stringify(kraDetails, null, 2));

    const status = checkKraProcessCheckStatus(kraDetails, undefined);
    console.log({
      status,
    });
    if (status == "AVAILABLE") {
      const downloadResponse = await this.kraSdk.panDownloadDetailsComplete({
        pan: pan,
        dob: dob.replaceAll("-", ""),
        mobile: env.KRA_MOB_NO,
      }) as T_APP_PAN_INQ_DOWNLOAD;

      const p = downloadResponse?.APP_RES_ROOT?.APP_PAN_INQ;
      const summ = downloadResponse?.APP_RES_ROOT?.APP_SUMM_REC;
      const fatcaList = downloadResponse?.APP_RES_ROOT?.FATCA_ADDL_DTLS ?? [];

      const normalizeForCompare = (s: string | null | undefined) =>
        (s ?? "").toString().trim().toUpperCase().replace(/\s+/g, " ");
      const normalizePan = (s: string | null | undefined) =>
        (s ?? "").toString().replace(/[- ]/g, "").toUpperCase();
      const normalizeMobile = (s: string | null | undefined) => {
        const raw = (s ?? "").toString().trim().replaceAll(" ", "");

        // remove +91, 91 if number more then 10 digits from the beginning
        if (raw.length > 10) {
          return raw.slice(-10).replace(/\D/g, "");
        }
        return raw;
      };
      const normalizeDob = (s: string | null | undefined) => {
        const raw = (s ?? "").toString().trim();
        if (!raw) return "";
        const d = raw.split(/[-/]/);
        if (d.length >= 3) {
          const day = (d[0] ?? "").padStart(2, "0");
          const month = (d[1] ?? "").padStart(2, "0");
          const year = (d[2] ?? "").length === 2 ? `20${d[2]}` : (d[2] ?? "");
          return `${day}-${month}-${year}`;
        }
        return raw;
      };

      const userFullName = normalizeForCompare(
        [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ")
      );
      const kraName = normalizeForCompare(p?.APP_NAME);
      const isNameMatch =
        kraName.length > 0 &&
        userFullName.length > 0 &&
        (kraName.includes(userFullName) ||
          userFullName.split(" ").every((part) => part.length < 2 || kraName.includes(part)));

      const kraDob = normalizeDob(p?.APP_DOB_DT);
      const userDob = normalizeDob(dob);
      const isDOBMatch = kraDob.length > 0 && userDob.length > 0 && kraDob === userDob;

      const kraPan = normalizePan(p?.APP_PAN_NO);
      const userPan = normalizePan(pan);
      const isPANMatch = kraPan.length > 0 && userPan.length > 0 && kraPan === userPan;

      const kraMobile = normalizeMobile(p?.APP_MOB_NO);
      const userMobile = normalizeMobile(user.phoneNo);
      const isMobileMatch = kraMobile.length > 0 && userMobile.length > 0 && kraMobile === userMobile;

      const kraEmail = (p?.APP_EMAIL ?? "").trim().toLowerCase();
      const userEmail = (user.emailAddress ?? "").trim().toLowerCase();
      const isEmailMatch = kraEmail.length > 0 && userEmail.length > 0 && kraEmail === userEmail;

      let appSummRecId: number | undefined;
      if (summ) {
        const summRec = await db.dataBase.kraAppSummRec.create({
          data: {
            appReqDate: summ.APP_REQ_DATE ?? undefined,
            appOthkraBatch: summ.APP_OTHKRA_BATCH ?? undefined,
            appOthkraCode: summ.APP_OTHKRA_CODE ?? undefined,
            appResponseDate: summ.APP_RESPONSE_DATE ?? undefined,
            appTotalRec: summ.APP_TOTAL_REC != null ? parseInt(summ.APP_TOTAL_REC, 10) : undefined,
            noOfFatcaAddlDtlsRecords: summ.NO_OF_FATCA_ADDL_DTLS_RECORDS != null ? parseInt(summ.NO_OF_FATCA_ADDL_DTLS_RECORDS, 10) : undefined,
          },
        });
        appSummRecId = summRec.id;
      }

      const kraRecord = await db.dataBase.kraDownloadResponse.create({
        data: {
          appIopFlg: p?.APP_IOP_FLG,
          appPosCode: p?.APP_POS_CODE,
          appType: p?.APP_TYPE,
          appKycMode: p?.APP_KYC_MODE,
          appNo: p?.APP_NO,
          appDate: p?.APP_DATE,
          appPanNo: p?.APP_PAN_NO,
          appPanexNo: p?.APP_PANEX_NO,
          appPanCopy: p?.APP_PAN_COPY,
          appExmt: p?.APP_EXMT,
          appExmtCat: p?.APP_EXMT_CAT,
          appExmtIdProof: p?.APP_EXMT_ID_PROOF,
          appIpvFlag: p?.APP_IPV_FLAG,
          appIpvDate: p?.APP_IPV_DATE,
          appGen: p?.APP_GEN,
          appName: p?.APP_NAME,
          appFName: p?.APP_F_NAME,
          appRegno: p?.APP_REGNO,
          appDobDt: p?.APP_DOB_DT,
          appDoiDt: p?.APP_DOI_DT,
          appCommenceDt: p?.APP_COMMENCE_DT,
          appNationality: p?.APP_NATIONALITY,
          appOthNationality: p?.APP_OTH_NATIONALITY,
          appCompStatus: p?.APP_COMP_STATUS,
          appOthCompStatus: p?.APP_OTH_COMP_STATUS,
          appResStatus: p?.APP_RES_STATUS,
          appResStatusProof: p?.APP_RES_STATUS_PROOF,
          appUidNo: p?.APP_UID_NO,
          appCorAdd1: p?.APP_COR_ADD1,
          appCorAdd2: p?.APP_COR_ADD2,
          appCorAdd3: p?.APP_COR_ADD3,
          appCorCity: p?.APP_COR_CITY,
          appCorPincd: p?.APP_COR_PINCD,
          appCorState: p?.APP_COR_STATE,
          appCorCtry: p?.APP_COR_CTRY,
          appOffNo: p?.APP_OFF_NO,
          appResNo: p?.APP_RES_NO,
          appMobNo: p?.APP_MOB_NO,
          appFaxNo: p?.APP_FAX_NO,
          appEmail: p?.APP_EMAIL,
          appCorAddProof: p?.APP_COR_ADD_PROOF,
          appCorAddRef: p?.APP_COR_ADD_REF,
          appCorAddDt: p?.APP_COR_ADD_DT,
          appPerAdd1: p?.APP_PER_ADD1,
          appPerAdd2: p?.APP_PER_ADD2,
          appPerAdd3: p?.APP_PER_ADD3,
          appPerCity: p?.APP_PER_CITY,
          appPerPincd: p?.APP_PER_PINCD,
          appPerState: p?.APP_PER_STATE,
          appPerCtry: p?.APP_PER_CTRY,
          appPerAddProof: p?.APP_PER_ADD_PROOF,
          appPerAddRef: p?.APP_PER_ADD_REF,
          appPerAddDt: p?.APP_PER_ADD_DT,
          appIncome: p?.APP_INCOME,
          appOcc: p?.APP_OCC,
          appOthOcc: p?.APP_OTH_OCC,
          appPolConn: p?.APP_POL_CONN,
          appDocProof: p?.APP_DOC_PROOF,
          appInternalRef: p?.APP_INTERNAL_REF,
          appBranchCode: p?.APP_BRANCH_CODE,
          appMarStatus: p?.APP_MAR_STATUS,
          appNetWrth: p?.APP_NETWRTH,
          appNetWorthDt: p?.APP_NETWORTH_DT,
          appIncorpPlc: p?.APP_INCORP_PLC,
          appOtherinfo: p?.APP_OTHERINFO,
          appFiller1: p?.APP_FILLER1,
          appFiller2: p?.APP_FILLER2,
          appFiller3: p?.APP_FILLER3,
          appRemarks: p?.APP_REMARKS,
          appStatus: p?.APP_STATUS,
          appStatusdt: p?.APP_STATUSDT,
          appErrorDesc: p?.APP_ERROR_DESC,
          appDumpType: p?.APP_DUMP_TYPE,
          appDnlddt: p?.APP_DNLDDT,
          appKraInfo: p?.APP_KRA_INFO,
          appSignature: p?.APP_SIGNATURE,
          appFatcaApplicableFlag: p?.APP_FATCA_APPLICABLE_FLAG,
          appFatcaBirthPlace: p?.APP_FATCA_BIRTH_PLACE,
          appFatcaBirthCountry: p?.APP_FATCA_BIRTH_COUNTRY,
          appFatcaCountryRes: p?.APP_FATCA_COUNTRY_RES,
          appFatcaCountryCityzenship: p?.APP_FATCA_COUNTRY_CITYZENSHIP,
          appFatcaDateDeclaration: p?.APP_FATCA_DATE_DECLARATION,
          appSummRecId: appSummRecId ?? undefined,
          isNameMatch,
          isDOBMatch,
          isPANMatch,
          isMobileMatch,
          isEmailMatch,
          rawXml: JSON.stringify(downloadResponse),

        },
        include: {
          appSummRec: true,
          fatcaAddlDtls: true,
        }
      });

      if (fatcaList.length > 0 && kraRecord.id) {
        await db.dataBase.kraFatcaAddlDtls.createMany({
          data: fatcaList.map((f) => ({
            kraDownloadResponseId: kraRecord.id,
            appFatcaEntityPan: f.APP_FATCA_ENTITY_PAN,
            appFatcaCountryResidency: f.APP_FATCA_COUNTRY_RESIDENCY,
            appFatcaTaxIdentificationNo: f.APP_FATCA_TAX_IDENTIFICATION_NO,
            appFatcaTaxExemptFlag: f.APP_FATCA_TAX_EXEMPT_FLAG,
            appFatcaTaxExemptReason: f.APP_FATCA_TAX_EXEMPT_REASON,
          })),
        });
      }

      console.log("KRA Record Created", new Date());


      console.log("========================== Returning KRA Record ==========================", new Date());
      return {
        ...kraRecord,
        status: kraDetails.APP_RES_ROOT.APP_PAN_INQ.APP_STATUS,
      };
    }

    throw new AppError(`${kraDetails.APP_RES_ROOT.APP_PAN_INQ.APP_STATUS}`, {
      code: "KRA_VERIFICATION_FAILED",
      statusCode: 400,
    });
  }

  /**
   * Mock KRA verify request: creates KraDownloadResponse + KraAppSummRec + KraFatcaAddlDtls
   * using sample APP_RES_ROOT structure so DB matches real API response (same codes/values).
   */
  async createKraVerifyRequestMock(
    userId: number,
    { pan, dob }: { pan: string; dob: string }
  ) {
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new AppError("User Not Found", {
        code: "USER_NOT_FOUND",
        statusCode: 404,
      });
    }

    const mockPan = pan.replace(/[- ]/g, "").toUpperCase() || "DUMPA0032D";
    const mockDob = dob.trim() || "29/10/1999";
    const mockMobile = (user.phoneNo ?? "").replace(/\D/g, "") || "7038984595";
    const mockEmail = (user.emailAddress ?? "").trim().toLowerCase() || "ganeshvijayavchar8793@gmail.com";

    // APP_PAN_INQ – same structure and codes as real KRA response (DB stores response as-is)
    const p = {
      APP_NO: "FV7321",
      APP_GEN: user.gender === "MALE" ? "M" : user.gender === "FEMALE" ? "F" : "M",
      APP_OCC: "08",
      APP_DATE: "13/11/2020",
      APP_EXMT: "N",
      APP_NAME: "SOURAV BAPARI",
      APP_TYPE: "I",
      APP_EMAIL: mockEmail,
      APP_REGNO: "",
      APP_DNLDDT: "18/03/2026 01:19:58",
      APP_DOB_DT: mockDob,
      APP_DOI_DT: "",
      APP_FAX_NO: "",
      APP_F_NAME: "VIJAY AVACHAR",
      APP_INCOME: "01",
      APP_MOB_NO: mockMobile,
      APP_OFF_NO: "",
      APP_PAN_NO: mockPan,
      APP_RES_NO: "",
      APP_STATUS: "07",
      APP_UID_NO: "N",
      APP_FILLER1: "",
      APP_FILLER2: "",
      APP_FILLER3: "",
      APP_IOP_FLG: "II",
      APP_NETWRTH: "",
      APP_OTH_OCC: "",
      APP_REMARKS: "",
      APP_COR_ADD1: "N 41 A F 3 4 1 4TH SCHEME",
      APP_COR_ADD2: "CIDCO NASHIK",
      APP_COR_ADD3: "",
      APP_COR_CITY: "NASHIK",
      APP_COR_CTRY: "101",
      APP_EXMT_CAT: "",
      APP_IPV_DATE: "13/11/2020",
      APP_IPV_FLAG: "Y",
      APP_KRA_INFO: "CVLKRA",
      APP_KYC_MODE: "0",
      APP_PANEX_NO: "",
      APP_PAN_COPY: "Y",
      APP_PER_ADD1: "N 41 A F 3 4 1 4TH SCHEME",
      APP_PER_ADD2: "CIDCO NASHIK",
      APP_PER_ADD3: "",
      APP_PER_CITY: "NASHIK",
      APP_PER_CTRY: "101",
      APP_POL_CONN: "NA",
      APP_POS_CODE: env.KRA_OKRA_CD_MI_ID ?? "B0954",
      APP_STATUSDT: "13/09/2023 17:42:03",
      APP_COR_PINCD: "422009",
      APP_COR_STATE: "027",
      APP_DOC_PROOF: "S",
      APP_DUMP_TYPE: "S",
      APP_OTHERINFO: "FATCA DETAILS RECEIVED - BATCH",
      APP_PER_PINCD: "422009",
      APP_PER_STATE: "027",
      APP_SIGNATURE: "",
      APP_COR_ADD_DT: "01/01/1900",
      APP_ERROR_DESC: "ERR-00000",
      APP_INCORP_PLC: "",
      APP_MAR_STATUS: "02",
      APP_PER_ADD_DT: "01/01/1900",
      APP_RES_STATUS: "R",
      APP_BRANCH_CODE: "HEADOFFICE",
      APP_COMMENCE_DT: "01/01/1900",
      APP_COMP_STATUS: "",
      APP_COR_ADD_REF: "",
      APP_NATIONALITY: "01",
      APP_NETWORTH_DT: "01/01/1900",
      APP_PER_ADD_REF: "",
      APP_INTERNAL_REF: "WEBSOLICIT",
      APP_COR_ADD_PROOF: "31",
      APP_EXMT_ID_PROOF: "01",
      APP_PER_ADD_PROOF: "31",
      APP_OTH_COMP_STATUS: "",
      APP_OTH_NATIONALITY: "",
      APP_RES_STATUS_PROOF: "",
      APP_FATCA_BIRTH_PLACE: "",
      APP_FATCA_COUNTRY_RES: "",
      APP_FATCA_BIRTH_COUNTRY: "",
      APP_FATCA_APPLICABLE_FLAG: "N",
      APP_FATCA_DATE_DECLARATION: "13/09/2021",
      APP_FATCA_COUNTRY_CITYZENSHIP: "",
    };

    const normalizeForCompare = (s: string | null | undefined) =>
      (s ?? "").toString().trim().toUpperCase().replace(/\s+/g, " ");
    const normalizePan = (s: string | null | undefined) =>
      (s ?? "").toString().replace(/[- ]/g, "").toUpperCase();
    const normalizeMobile = (s: string | null | undefined) =>
      (s ?? "").toString().replace(/\D/g, "");
    const normalizeDob = (raw: string | null | undefined) => {
      const s = (raw ?? "").toString().trim();
      if (!s) return "";
      const d = s.split(/[-/]/);
      if (d.length >= 3) {
        const day = (d[0] ?? "").padStart(2, "0");
        const month = (d[1] ?? "").padStart(2, "0");
        const year = (d[2] ?? "").length === 2 ? `20${d[2]}` : (d[2] ?? "");
        return `${day}-${month}-${year}`;
      }
      return s;
    };
    const userFullName = normalizeForCompare(
      [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ")
    );
    const kraName = normalizeForCompare(p.APP_NAME);
    const isNameMatch =
      kraName.length > 0 &&
      userFullName.length > 0 &&
      (kraName.includes(userFullName) ||
        userFullName.split(" ").every((part) => part.length < 2 || kraName.includes(part)));
    const kraDob = normalizeDob(p.APP_DOB_DT);
    const userDob = normalizeDob(dob);
    const isDOBMatch = kraDob.length > 0 && userDob.length > 0 && kraDob === userDob;
    const kraPan = normalizePan(p.APP_PAN_NO);
    const userPan = normalizePan(pan);
    const isPANMatch = kraPan.length > 0 && userPan.length > 0 && kraPan === userPan;
    const kraMobile = normalizeMobile(p.APP_MOB_NO);
    const userMobile = normalizeMobile(user.phoneNo);
    const isMobileMatch =
      kraMobile.length > 0 && userMobile.length > 0 && kraMobile === userMobile;
    const kraEmail = (p.APP_EMAIL ?? "").trim().toLowerCase();
    const userEmail = (user.emailAddress ?? "").trim().toLowerCase();
    console.log(kraEmail, userEmail);
    const isEmailMatch = kraEmail.length > 0 && userEmail.length > 0 && kraEmail === userEmail;

    // APP_SUMM_REC – same as response
    const summ = {
      APP_REQ_DATE: "14-03-2026 01:19:58",
      APP_TOTAL_REC: "1",
      APP_OTHKRA_CODE: "B0954",
      APP_OTHKRA_BATCH: "423118902",
      APP_RESPONSE_DATE: "14-03-2026 01:19:58",
      NO_OF_FATCA_ADDL_DTLS_RECORDS: "0",
    };
    const summRec = await db.dataBase.kraAppSummRec.create({
      data: {
        appReqDate: summ.APP_REQ_DATE ?? undefined,
        appOthkraBatch: summ.APP_OTHKRA_BATCH ?? undefined,
        appOthkraCode: summ.APP_OTHKRA_CODE ?? undefined,
        appResponseDate: summ.APP_RESPONSE_DATE ?? undefined,
        appTotalRec: summ.APP_TOTAL_REC != null ? parseInt(summ.APP_TOTAL_REC, 10) : undefined,
        noOfFatcaAddlDtlsRecords:
          summ.NO_OF_FATCA_ADDL_DTLS_RECORDS != null
            ? parseInt(summ.NO_OF_FATCA_ADDL_DTLS_RECORDS, 10)
            : undefined,
      },
    });

    const kraRecord = await db.dataBase.kraDownloadResponse.create({
      data: {
        appIopFlg: p.APP_IOP_FLG,
        appPosCode: p.APP_POS_CODE,
        appType: p.APP_TYPE,
        appKycMode: p.APP_KYC_MODE,
        appNo: p.APP_NO,
        appDate: p.APP_DATE,
        appPanNo: p.APP_PAN_NO,
        appPanexNo: p.APP_PANEX_NO,
        appPanCopy: p.APP_PAN_COPY,
        appExmt: p.APP_EXMT,
        appExmtCat: p.APP_EXMT_CAT,
        appExmtIdProof: p.APP_EXMT_ID_PROOF,
        appIpvFlag: p.APP_IPV_FLAG,
        appIpvDate: p.APP_IPV_DATE,
        appGen: p.APP_GEN,
        appName: p.APP_NAME,
        appFName: p.APP_F_NAME,
        appRegno: p.APP_REGNO,
        appDobDt: p.APP_DOB_DT,
        appDoiDt: p.APP_DOI_DT,
        appCommenceDt: p.APP_COMMENCE_DT,
        appNationality: p.APP_NATIONALITY,
        appOthNationality: p.APP_OTH_NATIONALITY,
        appCompStatus: p.APP_COMP_STATUS,
        appOthCompStatus: p.APP_OTH_COMP_STATUS,
        appResStatus: p.APP_RES_STATUS,
        appResStatusProof: p.APP_RES_STATUS_PROOF,
        appUidNo: p.APP_UID_NO,
        appCorAdd1: p.APP_COR_ADD1,
        appCorAdd2: p.APP_COR_ADD2,
        appCorAdd3: p.APP_COR_ADD3,
        appCorCity: p.APP_COR_CITY,
        appCorPincd: p.APP_COR_PINCD,
        appCorState: p.APP_COR_STATE,
        appCorCtry: p.APP_COR_CTRY,
        appOffNo: p.APP_OFF_NO,
        appResNo: p.APP_RES_NO,
        appMobNo: p.APP_MOB_NO,
        appFaxNo: p.APP_FAX_NO,
        appEmail: p.APP_EMAIL,
        appCorAddProof: p.APP_COR_ADD_PROOF,
        appCorAddRef: p.APP_COR_ADD_REF,
        appCorAddDt: p.APP_COR_ADD_DT,
        appPerAdd1: p.APP_PER_ADD1,
        appPerAdd2: p.APP_PER_ADD2,
        appPerAdd3: p.APP_PER_ADD3,
        appPerCity: p.APP_PER_CITY,
        appPerPincd: p.APP_PER_PINCD,
        appPerState: p.APP_PER_STATE,
        appPerCtry: p.APP_PER_CTRY,
        appPerAddProof: p.APP_PER_ADD_PROOF,
        appPerAddRef: p.APP_PER_ADD_REF,
        appPerAddDt: p.APP_PER_ADD_DT,
        appIncome: p.APP_INCOME,
        appOcc: p.APP_OCC,
        appOthOcc: p.APP_OTH_OCC,
        appPolConn: p.APP_POL_CONN,
        appDocProof: p.APP_DOC_PROOF,
        appInternalRef: p.APP_INTERNAL_REF,
        appBranchCode: p.APP_BRANCH_CODE,
        appMarStatus: p.APP_MAR_STATUS,
        appNetWrth: p.APP_NETWRTH,
        appNetWorthDt: p.APP_NETWORTH_DT,
        appIncorpPlc: p.APP_INCORP_PLC,
        appOtherinfo: p.APP_OTHERINFO,
        appFiller1: p.APP_FILLER1,
        appFiller2: p.APP_FILLER2,
        appFiller3: p.APP_FILLER3,
        appRemarks: p.APP_REMARKS,
        appStatus: p.APP_STATUS,
        appStatusdt: p.APP_STATUSDT,
        appErrorDesc: p.APP_ERROR_DESC,
        appDumpType: p.APP_DUMP_TYPE,
        appDnlddt: p.APP_DNLDDT,
        appKraInfo: p.APP_KRA_INFO,
        appSignature: p.APP_SIGNATURE,
        appFatcaApplicableFlag: p.APP_FATCA_APPLICABLE_FLAG,
        appFatcaBirthPlace: p.APP_FATCA_BIRTH_PLACE,
        appFatcaBirthCountry: p.APP_FATCA_BIRTH_COUNTRY,
        appFatcaCountryRes: p.APP_FATCA_COUNTRY_RES,
        appFatcaCountryCityzenship: p.APP_FATCA_COUNTRY_CITYZENSHIP,
        appFatcaDateDeclaration: p.APP_FATCA_DATE_DECLARATION,
        appSummRecId: summRec.id,
        isNameMatch,
        isDOBMatch,
        isPANMatch,
        isMobileMatch,
        isEmailMatch,
        rawXml: JSON.stringify(p),
      },
    });

    const fatcaList = [
      {
        APP_FATCA_ENTITY_PAN: "",
        APP_FATCA_TAX_EXEMPT_FLAG: "",
        APP_FATCA_COUNTRY_RESIDENCY: "",
        APP_FATCA_TAX_EXEMPT_REASON: "",
        APP_FATCA_TAX_IDENTIFICATION_NO: "",
      },
      {
        APP_FATCA_ENTITY_PAN: "",
        APP_FATCA_TAX_EXEMPT_FLAG: "",
        APP_FATCA_COUNTRY_RESIDENCY: "",
        APP_FATCA_TAX_EXEMPT_REASON: "",
        APP_FATCA_TAX_IDENTIFICATION_NO: "",
      },
      {
        APP_FATCA_ENTITY_PAN: "",
        APP_FATCA_TAX_EXEMPT_FLAG: "",
        APP_FATCA_COUNTRY_RESIDENCY: "",
        APP_FATCA_TAX_EXEMPT_REASON: "",
        APP_FATCA_TAX_IDENTIFICATION_NO: "",
      },
      {
        APP_FATCA_ENTITY_PAN: "",
        APP_FATCA_TAX_EXEMPT_FLAG: "",
        APP_FATCA_COUNTRY_RESIDENCY: "",
        APP_FATCA_TAX_EXEMPT_REASON: "",
        APP_FATCA_TAX_IDENTIFICATION_NO: "",
      },
    ];
    if (fatcaList.length > 0 && kraRecord.id) {
      await db.dataBase.kraFatcaAddlDtls.createMany({
        data: fatcaList.map((f) => ({
          kraDownloadResponseId: kraRecord.id,
          appFatcaEntityPan: f.APP_FATCA_ENTITY_PAN,
          appFatcaCountryResidency: f.APP_FATCA_COUNTRY_RESIDENCY,
          appFatcaTaxIdentificationNo: f.APP_FATCA_TAX_IDENTIFICATION_NO,
          appFatcaTaxExemptFlag: f.APP_FATCA_TAX_EXEMPT_FLAG,
          appFatcaTaxExemptReason: f.APP_FATCA_TAX_EXEMPT_REASON,
        })),
      });
    }

    return kraRecord;
  }
}
