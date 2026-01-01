import { db, type CustomerProfileDataModel } from "@core/database/database";
import { env } from "@packages/config/env";
import { ParticipantManager } from "@services/refq/nse/cbrics_manager.service";
import { makeFullname } from "@utils/generate/generate_username";
import type {
  T_APP_PAN_INQ,
  T_APP_PAN_INQ_DOWNLOAD,
  T_APP_PAN_REGISTER_REQUEST_PAYLOAD,
} from "kyc-providers";
import {
  KraSDK,
  removeLastCommaChunks,
  splitAddressInto3BalancedLines,
} from "kyc-providers";
import type { Root } from "@packages/kyc-providers/pdf/dataMapper";
import {
  checkIsKraMatched,
  checkKraProcessCheckStatus,
} from "./CheckKraStatus";
import { getKraCountry, getKraState, kraMobNo } from "./constent";
import { addKraWorkerJob, type KraWorkerJobData } from "./kraWroker.helper";
import { cacheStorage } from "@store/redis_store";
import { removeCountryCode } from "@utils/filters/convert";

const cbricsManager = new ParticipantManager();

export class KraWorkerService {
  private kraProcess = new KraProcess();

  async processKra(data: KraWorkerJobData) {
    const cachedKey = `KRA:${data.customerId}-${data.kycDataStoreId}`;
    const TTL_28_HOURS = 28 * 60 * 60; // seconds = 100,800

    const lastTask = await cacheStorage.get(cachedKey);
    const { customerId, kycDataStoreId } = data;
    try {
      const customer = await db.dataBase.customerProfileDataModel.findUnique({
        where: { id: customerId },
      });
      if (!customer) throw new Error("Customer not found");

      const payload = await db.dataBase.kYC_FLOW.findFirst({
        where: { id: kycDataStoreId, userID: customerId },
      });

      if (!payload) {
        throw new Error("KYC payload not found or does not belong to user");
      }

      const kyc = payload.data as Root;

      const res = await this.kraProcess.enquiry({
        kycdataId: kycDataStoreId,
        data: kyc,
        customer,
      });

      const status = checkKraProcessCheckStatus(res as T_APP_PAN_INQ);

      if (status == "ERROR") {
        throw new Error("KRA Process encountered an error.");
      }

      if (status == "WAITING") {
        await addKraWorkerJob(data);
        return;
      }

      if (status == "REGISTER") {
        await this.kraProcess.register({
          kycdataId: kycDataStoreId,
          data: kyc,
          customer,
        });
        await addKraWorkerJob(data);
        await cacheStorage.set(cachedKey, "REGISTER", TTL_28_HOURS); // 28 Hr
        return;
      }

      // Download Allow -
      if (status == "AVAILABLE") {
        let isMatched = false;
        if (!lastTask) {
          const downloadRes = (await this.kraProcess.downloadKraReport({
            kycdataId: kycDataStoreId,
            data: kyc,
            customer,
          })) as T_APP_PAN_INQ_DOWNLOAD;
          isMatched = checkIsKraMatched(kyc, customer, downloadRes);
        } else {
          isMatched = true;
        }

        if (isMatched) {
          try {
            const cbUser = await cbricsManager.registerParticipant(customerId);
            await db.dataBase.customerProfileDataModel.update({
              where: { id: customerId },
              data: { kycStatus: "VERIFIED", kraStatus: "VERIFIED" },
            });
            await db.dataBase.kraDataLogs.create({
              data: {
                requestData: {
                  customerId: customerId,
                },
                responseData: cbUser,
                userId: customer.id,
                kycId: kycDataStoreId,
                stage: "REGISTER",
                reqTime: new Date().toISOString(),
                resTime: new Date().toISOString(),
              },
            });
          } catch (error) {
            await db.dataBase.kraDataLogs.create({
              data: {
                requestData: {
                  customerId: customerId,
                },
                responseData: {
                  error: "CBRICS Registration Failed",
                  message: error?.toString(),
                },
                userId: customer.id,
                kycId: kycDataStoreId,
                stage: "FAILED_CBRICS_REGISTRATION",
                reqTime: new Date().toISOString(),
                resTime: new Date().toISOString(),
              },
            });
          }
          return;
        } else {
          await this.kraProcess.modify({
            kycdataId: kycDataStoreId,
            data: kyc,
            customer,
          });
          await addKraWorkerJob(data);
          await cacheStorage.set(cachedKey, "MODIFY", TTL_28_HOURS);
          return;
        }
      }
      return res;
    } catch (err) {
      console.error("KraWorkerService.processKra error:", err);
      throw err;
    }
  }
}

type processPayload = {
  kycdataId: number;
  data: Root;
  customer: CustomerProfileDataModel;
};

export class KraProcess {
  private kraInstance = new KraSDK({
    okraCdOrMiId: env.KRA_OKRA_CD_MI_ID,
    passKey: env.KRA_PASS_KEY,
    password: env.KRA_PASSWORD,
    userName: env.KRA_USERNAME,
    env: env.KRA_ENV,
  });

  private counter = 0;

  private generateReqNo() {
    const base = Date.now() % 10_000_000;
    this.counter = (this.counter + 1) % 1000;
    return `${base}${this.counter.toString().padStart(3, "0")}`.replaceAll(
      "-",
      ""
    );
  }

  async enquiry({ customer, data, kycdataId }: processPayload) {
    const cachedKey = `KRA:${customer.id}-${kycdataId}`;
    const lastTask = await cacheStorage.get(cachedKey);

    const reqTime = new Date().toISOString();
    const payload = {
      pan: data.step_1.pan.panCardNo,
      dob: data.step_1.pan.dateOfBirth.split("T")[0]?.toString() || "",
      mobile: kraMobNo,
      reqNo: this.generateReqNo(),
    };

    const enquiry = await this.kraInstance.panInquiry(payload);

    const resTime = new Date().toISOString();
    await db.dataBase.customerProfileDataModel.update({
      where: {
        id: customer.id,
      },
      data: {
        kraStatus:
          (lastTask || "ENQUIRY") +
          "_" +
          (enquiry.APP_RES_ROOT.APP_PAN_INQ.APP_UPDT_STATUS ||
            enquiry.APP_RES_ROOT.APP_PAN_INQ.APP_STATUS),
      },
    });

    await db.dataBase.kraDataLogs.create({
      data: {
        requestData: payload,
        responseData: enquiry,
        userId: customer.id,
        kycId: kycdataId,
        stage:
          (lastTask || "ENQUIRY") +
          "_" +
          enquiry.APP_RES_ROOT.APP_PAN_INQ.APP_STATUS,
        reqTime,
        resTime,
      },
    });

    return enquiry;
  }

  async downloadKraReport({ customer, data, kycdataId }: processPayload) {
    const reqTime = new Date().toISOString();

    const payload = {
      dob: formatDate(new Date(data.step_1.pan.dateOfBirth)).replaceAll(
        "-",
        ""
      ),
      pan: data.step_1.pan.panCardNo.split("-").reverse().join(""),
      mobile: kraMobNo,
      reqNo: this.generateReqNo(),
    };

    const report = await this.kraInstance.panDownloadDetailsComplete(payload);
    const resTime = new Date().toISOString();
    await db.dataBase.customerProfileDataModel.update({
      where: {
        id: customer.id,
      },
      data: {
        kraStatus: "DOWNLOAD_KRA_" + report.APP_RES_ROOT.APP_PAN_INQ.APP_STATUS,
      },
    });
    await db.dataBase.kraDataLogs.create({
      data: {
        requestData: payload,
        responseData: report,
        userId: customer.id,
        kycId: kycdataId,
        stage: "DOWNLOAD_KRA_" + report.APP_RES_ROOT.APP_PAN_INQ.APP_STATUS,
        reqTime,
        resTime,
      },
    });

    return report;
  }

  async register({ customer, data, kycdataId }: processPayload) {
    const reqTime = new Date().toISOString();
    const payload = this.buildRegisterPayload(data, customer);

    const report = await this.kraInstance.panRegisterUploadKraXML(payload);
    const resTime = new Date().toISOString();
    await db.dataBase.customerProfileDataModel.update({
      where: {
        id: customer.id,
      },
      data: {
        kraStatus: "REGISTER_" + report.APP_RES_ROOT.APP_PAN_INQ.APP_STATUS,
      },
    });
    await db.dataBase.kraDataLogs.create({
      data: {
        requestData: payload,
        responseData: report as object,
        userId: customer.id,
        kycId: kycdataId,
        stage: "REGISTER_" + report.APP_RES_ROOT.APP_PAN_INQ.APP_STATUS,
        reqTime,
        resTime,
      },
    });

    return report;
  }

  async modify({ customer, data, kycdataId }: processPayload) {
    const reqTime = new Date().toISOString();
    const payload = this.buildRegisterPayload(data, customer, true);

    const p = payload.APP_PAN_INQ;

    const report = await this.kraInstance.panModifyKraXML({
      panInquiry: {
        APP_COR_ADD1: p.APP_COR_ADD1,
        APP_COR_ADD2: p.APP_COR_ADD2,
        APP_COR_ADD3: p.APP_COR_ADD3,
        APP_COR_ADD_PROOF: p.APP_COR_ADD_PROOF,
        APP_COR_ADD_REF: p.APP_COR_ADD_REF,
        APP_COR_CITY: p.APP_COR_CITY,
        APP_COR_CTRY: p.APP_COR_CTRY,
        APP_COR_PINCD: p.APP_COR_PINCD,
        APP_COR_STATE: p.APP_COR_STATE,
        APP_DATE: p.APP_DATE,
        APP_DOB_DT: p.APP_DOB_DT,
        APP_DOC_PROOF: p.APP_DOC_PROOF,
        APP_EMAIL: p.APP_EMAIL,
        APP_EXMT: p.APP_EXMT,
        APP_EXMT_CAT: p.APP_EXMT_CAT,
        APP_EXMT_ID_PROOF: p.APP_EXMT_ID_PROOF,
        APP_F_NAME: p.APP_F_NAME,
        APP_FATCA_APPLICABLE_FLAG: p.APP_FATCA_APPLICABLE_FLAG as "Y" | "N",
        APP_FATCA_BIRTH_COUNTRY: p.APP_FATCA_BIRTH_COUNTRY,
        APP_FATCA_BIRTH_PLACE: p.APP_FATCA_BIRTH_PLACE,
        APP_FATCA_COUNTRY_CITYZENSHIP: p.APP_FATCA_COUNTRY_CITYZENSHIP,
        APP_FATCA_DATE_DECLARATION: p.APP_FATCA_DATE_DECLARATION,
        APP_GEN: p.APP_GEN,
        APP_INCOME: p.APP_INCOME,
        APP_IOP_FLG: p.APP_IOP_FLG,
        APP_IPV_DATE: p.APP_IPV_DATE,
        APP_IPV_FLAG: p.APP_IPV_FLAG,
        APP_KYC_MODE: p.APP_KYC_MODE,
        APP_MOBILE_NO: p.APP_MOB_NO,
        APP_NAME: p.APP_NAME,
        APP_NATIONALITY: p.APP_NATIONALITY,
        APP_NO: p.APP_NO,
        APP_OCC: p.APP_OCC,
        APP_PAN_COPY: p.APP_PAN_COPY,
        APP_PAN_NO: p.APP_PAN_NO,
        APP_COR_ADD_DT: p.APP_COR_ADD_DT,
        APP_PANEX_NO: p.APP_PANEX_NO,
        APP_PER_ADD1: p.APP_PER_ADD1,
        APP_PER_ADD2: p.APP_PER_ADD2,
        APP_PER_ADD3: p.APP_PER_ADD3,
        APP_PER_CITY: p.APP_PER_CITY,
        APP_PER_CTRY: p.APP_PER_CTRY,
        APP_PER_PINCD: p.APP_PER_PINCD,
        APP_PER_STATE: p.APP_PER_STATE,
        APP_POL_CONN: p.APP_POL_CONN,
        APP_POS_CODE: p.APP_POS_CODE,
        APP_RES_STATUS: p.APP_RES_STATUS,
        APP_TYPE: p.APP_TYPE,
        APP_UID_NO: p.APP_UID_NO,
        APP_PER_ADD_PROOF: p.APP_PER_ADD_PROOF,
        APP_PER_ADD_DT: p.APP_PER_ADD_DT,
        APP_PER_ADD_REF: p.APP_PER_ADD_REF,
        APP_MAR_STATUS: p.APP_MAR_STATUS,
      },

      fatcaAdditionalDetails: payload.FATCA_ADDL_DTLS,
    });

    const resTime = new Date().toISOString();

    await db.dataBase.kraDataLogs.create({
      data: {
        requestData: payload,
        responseData: report as object,
        userId: customer.id,
        kycId: kycdataId,
        stage:
          "MODIFY_" +
          (report.APP_REQ_ROOT.APP_PAN_INQ.APP_STATUSDT ||
            report.APP_REQ_ROOT.APP_PAN_INQ.APP_STATUS),
        reqTime,
        resTime,
      },
    });
    await db.dataBase.customerProfileDataModel.update({
      where: {
        id: customer.id,
      },
      data: {
        kraStatus:
          "MODIFY_" +
          (report.APP_REQ_ROOT.APP_PAN_INQ.APP_STATUSDT ||
            report.APP_REQ_ROOT.APP_PAN_INQ.APP_STATUS),
      },
    });
    return report;
  }

  buildRegisterPayload(
    data: Root,
    customer: CustomerProfileDataModel,
    isModify: boolean = false
  ): T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"] {
    const panRaw = data.step_1?.pan?.panCardNo || "";
    const panNo = panRaw ? panRaw.split("-").reverse().join("") : "";

    const firstName = data.step_1?.pan?.firstName || "";
    const middleName = data.step_1?.pan?.middleName || "";
    const lastName = data.step_1?.pan?.lastName || "";
    const dob = data.step_1?.pan?.dateOfBirth.split("T")[0]?.toString() || "";
    const MAR_STATUS = data.step_2.maritalStatus == "MARRIED" ? "01" : "02";

    const corAddress = splitAddressInto3BalancedLines(
      removeLastCommaChunks(
        data.step_1.pan.response.details.aadhaar.current_address_details
          .address,
        3
      )
    );

    const porAddress = splitAddressInto3BalancedLines(
      removeLastCommaChunks(
        data.step_1.pan.response.details.aadhaar.permanent_address_details
          .address,
        3
      )
    );

    const appPanInq = {
      APP_IOP_FLG: isModify ? "II" : "IE",
      APP_POS_CODE: env.KRA_OKRA_CD_MI_ID || "",

      APP_TYPE: "I",
      APP_NO: "",
      APP_DATE: formatDateTime(new Date()),
      APP_PAN_NO: panNo,
      APP_PANEX_NO: "",
      APP_PAN_COPY: "Y",
      APP_EXMT: "N",
      APP_EXMT_CAT: "",
      APP_KYC_MODE: "5",
      APP_EXMT_ID_PROOF: "01",
      APP_IPV_FLAG: "N",
      APP_IPV_DATE: formatDate(new Date()),
      APP_GEN: data.step_1.pan.response.details.pan.gender,
      APP_NAME: makeFullname({ firstName, middleName, lastName }),
      APP_F_NAME: data.step_2.fatSpuName,
      APP_REGNO: "",
      APP_DOB_DT: formatDate(new Date(dob)),
      APP_DOI_DT: "",
      APP_COMMENCE_DT: "",
      APP_NATIONALITY: "01",
      APP_OTH_NATIONALITY: "",
      APP_COMP_STATUS: "",
      APP_OTH_COMP_STATUS: "",
      APP_RES_STATUS: "R",
      APP_RES_STATUS_PROOF: "",
      APP_UID_NO: data.step_1.pan.response.details.aadhaar.id_number.replaceAll(
        "x",
        "0"
      ),
      APP_COR_ADD1: corAddress.line1,
      APP_COR_ADD2: corAddress.line2,
      APP_COR_ADD3: corAddress.line3,
      APP_COR_CITY:
        data.step_1.pan.response.details.aadhaar.current_address_details
          .district_or_city,
      APP_COR_PINCD:
        data.step_1.pan.response.details.aadhaar.current_address_details
          .pincode,
      APP_COR_STATE: getKraState(
        data.step_1.pan.response.details.aadhaar.current_address_details.state
      )?.code,

      APP_COR_CTRY: getKraCountry("india")?.code,
      APP_OTH_COR_STATE: isModify
        ? getKraCountry(
            data.step_1.pan.response.details.aadhaar.current_address_details
              .state
          )?.code
        : undefined,
      APP_OFF_NO: "",
      APP_RES_NO: "",
      APP_MOB_NO: removeCountryCode(data?.user?.phoneNo || customer?.phoneNo),
      APP_FAX_NO: "",
      APP_EMAIL: data.user?.emailAddress || customer.emailAddress || "",
      APP_COR_ADD_PROOF: "31",
      APP_COR_ADD_REF:
        data.step_1.pan.response.details.aadhaar.id_number.replaceAll("x", ""),
      APP_COR_ADD_DT: "",
      APP_PER_ADD1: porAddress.line1,
      APP_PER_ADD2: porAddress.line2,
      APP_PER_ADD3: porAddress.line3,
      APP_PER_CITY:
        data.step_1.pan.response.details.aadhaar.permanent_address_details
          .district_or_city,
      APP_PER_PINCD:
        data.step_1.pan.response.details.aadhaar.permanent_address_details
          .pincode,
      APP_PER_STATE: getKraState(
        data.step_1.pan.response.details.aadhaar.permanent_address_details.state
      )?.code,
      APP_OTH_PER_STATE: "",
      APP_PER_CTRY: getKraCountry("india")?.code,
      APP_PER_ADD_PROOF: "31",
      APP_PER_ADD_REF:
        data.step_1.pan.response.details.aadhaar.id_number.replaceAll("x", ""),
      APP_PER_ADD_DT: "",
      APP_INCOME: "",
      APP_OCC: "",
      APP_OTH_OCC: "",
      APP_POL_CONN: "NA",
      APP_DOC_PROOF: "E",
      APP_INTERNAL_REF: "",
      APP_BRANCH_CODE: "",
      APP_MAR_STATUS: MAR_STATUS,
      APP_NETWRTH: "",
      APP_NETWORTH_DT: "",
      APP_INCORP_PLC: "",
      APP_OTHERINFO: "",
      APP_FILLER1: "",
      APP_FILLER2: "",
      APP_FILLER3: "",
      APP_DUMP_TYPE: "",

      APP_KRA_INFO: "",
      APP_SIGNATURE: "",
      APP_FATCA_APPLICABLE_FLAG: data.step_1?.pan?.isFatca ? "N" : "Y",
      APP_FATCA_BIRTH_PLACE: "",
      APP_FATCA_BIRTH_COUNTRY: "",
      APP_FATCA_COUNTRY_RES: "",
      APP_FATCA_COUNTRY_CITYZENSHIP: "",
      APP_FATCA_DATE_DECLARATION: formatDate(new Date()),
    };

    const appSummRec = {
      APP_REQ_DATE: formatDate(new Date()),
      APP_OTHKRA_BATCH: "",
      APP_OTHKRA_CODE: env.KRA_OKRA_CD_MI_ID || "",

      APP_TOTAL_REC: "1",
      NO_OF_FATCA_ADDL_DTLS_RECORDS: data.step_1?.pan?.isFatca ? "0" : "1",
    };

    const fatca =
      [] as T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"]["FATCA_ADDL_DTLS"];
    if (!data.step_1?.pan?.isFatca) {
      fatca.push({
        APP_FATCA_ENTITY_PAN: panNo,
        APP_FATCA_COUNTRY_RESIDENCY: "",
        APP_FATCA_TAX_IDENTIFICATION_NO: "",
        APP_FATCA_TAX_EXEMPT_FLAG: "",
        APP_FATCA_TAX_EXEMPT_REASON: "",
      });
    }

    return {
      APP_PAN_INQ: appPanInq,
      // FATCA_ADDL_DTLS: fatca,
      APP_SUMM_REC: appSummRec,
    } as T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"];
  }
}

export const formatDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export function formatDateTime(date: Date): string {
  // Convert to UTC first
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;

  // Add IST offset (5 hours 30 minutes)
  const istTime = new Date(utcTime + 5.5 * 60 * 60 * 1000);

  const dd = String(istTime.getDate()).padStart(2, "0");
  const mm = String(istTime.getMonth() + 1).padStart(2, "0");
  const yyyy = istTime.getFullYear();

  const HH = String(istTime.getHours()).padStart(2, "0");
  const MM = String(istTime.getMinutes()).padStart(2, "0");
  const SS = String(istTime.getSeconds()).padStart(2, "0");

  return `${dd}-${mm}-${yyyy} ${HH}:${MM}:${SS}`;
}
