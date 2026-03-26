import { db, type CustomerProfileDataModel } from "@core/database/database";
import { env } from "@packages/config/env";
import type { Root } from "@packages/kyc-providers/pdf/dataMapper";
import { ParticipantManager } from "@services/refq/nse/cbrics_manager.service";
import { cacheStorage } from "@store/redis_store";
import { removeCountryCode } from "@utils/filters/convert";
import { makeFullname } from "@utils/generate/generate_username";
import type {
  PanModifyKraPayload,
  T_APP_PAN_INQ,
  T_APP_PAN_INQ_DOWNLOAD,
  T_APP_PAN_REGISTER_REQUEST_PAYLOAD,
} from "kyc-providers";
import {
  KraSDK,
  removeLastCommaChunks,
  splitAddressInto3BalancedLines,
} from "kyc-providers";
import {
  checkIsKraMatched,
  checkKraProcessCheckStatus,
} from "./CheckKraStatus";
import { getKraCountry, getKraState, kraMobNo, occCode } from "./constent";
import { addKraWorkerJob, type KraWorkerJobData } from "./kraWroker.helper";
import type { AxiosError } from "axios";

const cbricsManager = new ParticipantManager();

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const TTL_72_HOURS = 72 * 60 * 60; // 72 hours

export class KraWorkerService {
  private kraProcess = new KraProcess();

  async processKra(data: KraWorkerJobData) {
    const cachedKey = `KRA:${data.customerId}-${data.kycDataStoreId}`;
    const runnerCachedKey = `KRA:${data.customerId}-${data.kycDataStoreId}-RUNNER`;

    const lastTask = await cacheStorage.get<string>(cachedKey);
    const { customerId, kycDataStoreId } = data;
    const runner = await cacheStorage.get<string>(runnerCachedKey);

    if (!runner) {
      await db.dataBase.kraDataLogs.create({
        data: {
          requestData: {
            Message: "Timeout - KRA Process not running 72 hours completed",
          },
          responseData: {
            error: "KRA Process 72 hours timeout",
            message: "Timeout - KRA Process not running 72 hours completed",
          },
          userId: customerId,
          kycId: kycDataStoreId,
          stage: "TIMEOUT_KRA_PROCESS",
          reqTime: new Date().toISOString(),
          resTime: new Date().toISOString(),
        },
      });
      return;
    }

    try {
      const customer = await db.dataBase.customerProfileDataModel.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        return;
      }

      const payload = await db.dataBase.kYC_FLOW.findFirst({
        where: { id: kycDataStoreId, userID: customerId },
      });



      if (!payload) {
        return;
      }

      const kyc = payload.data as Root;

      const isUsedKra = kyc.step_1.usedExistingKra;

      if (isUsedKra) {
        try {
          await this.registerOnCbrics(customerId, kycDataStoreId);
          return;
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
          return;
        }
      }

      const res = await this.kraProcess.enquiry({
        kycdataId: kycDataStoreId,
        data: kyc,
        customer,
      });

      const status = checkKraProcessCheckStatus(res as T_APP_PAN_INQ, lastTask);

      // FAILED (explicit) - Modify Failed

      if (status == "REJECTED") {
        // update customer profile data - set kyc status to under review and kra status to rejected
        // await db.dataBase.customerProfileDataModel.update({
        //   where: { id: customerId },
        //   data: { kycStatus: "UNDER_REVIEW", kraStatus: "REJECTED" },
        // });
        // create kra data log for failed request - set stage to KRA_FAILED_REQUEST
        await db.dataBase.kraDataLogs.create({
          data: {
            requestData: {
              Date: new Date().toISOString(),
              Message: "Request Failed - KRA Process rejected",
              LastTask: lastTask,
              Status: status,
              Error: "KRA Process rejected",
            },
            responseData: res,
            userId: customerId,
            kycId: kycDataStoreId,
            stage: "KRA_FAILED_REQUEST",
            reqTime: new Date().toISOString(),
            resTime: new Date().toISOString(),
          },
        });
        return;
      }

      if (status == "ERROR") {
        await db.dataBase.kraDataLogs.create({
          data: {
            requestData: {
              Date: new Date().toISOString(),
              Message: "Request Failed - KRA Process error",
              LastTask: lastTask,
              Status: status,
              Error: "KRA Process error - " + res?.APP_RES_ROOT?.APP_PAN_INQ?.ERROR,
            },
            responseData: res,
            userId: customerId,
            kycId: kycDataStoreId,
            stage: "KRA_FAILED_REQUEST",
            reqTime: new Date().toISOString(),
            resTime: new Date().toISOString(),
          },
        });
        return;
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
        return;
      }

      // Download Allow -
      if (status == "AVAILABLE") {
        let isMatched = false;
        await delay(5000); // wait for 5 sec before download
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
          await delay(5000);
          try {
            await this.registerOnCbrics(customerId, kycDataStoreId);
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
          } try {
            await this.registerOnCbrics(customerId, kycDataStoreId);
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
          await delay(5000);
          await this.kraProcess.modify({
            kycdataId: kycDataStoreId,
            data: kyc,
            customer,
          });
          await addKraWorkerJob(data);
          return;
        }
      }
      return res;
    } catch (err) {
      console.error("KRA PROCESS FAILED - Rescheduling the job");
      console.error(
        "KRA PROCESS FAILED - ",
        (err as AxiosError)?.response?.data,
      );
      if (lastTask) {
        await cacheStorage.set(cachedKey, lastTask, TTL_72_HOURS);
      }
      await db.dataBase.kraDataLogs.create({
        data: {
          kycId: kycDataStoreId,
          userId: customerId,
          requestData: {
            Date: new Date().toISOString(),
            Message: "Request Failed - Rescheduling the job",
          },
          responseData: {
            error: "KRA Process encountered an error. Rescheduling the job",
            httpStatus: (err as AxiosError)?.response?.status,
            message:
              (
                (err as AxiosError)?.response?.data as {
                  message?: string;
                  error?: string;
                  errors?: { message?: string }[];
                }
              )?.message?.toString() ||
              (
                (err as AxiosError)?.response?.data as {
                  message?: string;
                  error?: string;
                  errors?: { message?: string }[];
                }
              )?.error?.toString() ||
              (
                (err as AxiosError)?.response?.data as {
                  message?: string;
                  error?: string;
                  errors?: { message?: string }[];
                }
              )?.errors?.[0]?.message?.toString() ||
              (err as Error)?.message?.toString() ||
              "Request Failed",
          },
          stage: "KRA_FAILED_REQUEST ",
          reqTime: new Date().toISOString(),
          resTime: new Date().toISOString(),
        },
      });
      await addKraWorkerJob(data);
      throw err;
    }
  }
  async registerOnCbrics(customerId: number, kycDataStoreId: number) {
    try {
      const cbUser =
        await cbricsManager.registerParticipant(customerId);
      await db.dataBase.customerProfileDataModel.update({
        where: { id: customerId },
        data: {
          kycStatus: "VERIFIED",
          kraStatus: "VERIFIED",
          verifyDate: new Date(),
        },
      });
      await db.dataBase.kraDataLogs.create({
        data: {
          requestData: {
            customerId: customerId,
          },
          responseData: cbUser,
          userId: customerId,
          kycId: kycDataStoreId,
          stage: "CBRICS_REGISTER_SUCCESS",
          reqTime: new Date().toISOString(),
          resTime: new Date().toISOString(),
        },
      });
    } catch (error) {
      const err = error as AxiosError;
      await db.dataBase.customerProfileDataModel.update({
        where: { id: customerId },
        data: {
          kraStatus: "CBRICS PENDING",
        },
      });
      await db.dataBase.kraDataLogs.create({
        data: {
          requestData: {
            customerId: customerId,
          },
          responseData: err.response?.data || err.message,
          userId: customerId,
          kycId: kycDataStoreId,
          stage: "KRA COMPLETED - ERROR_CBRICS_REGISTER",
          reqTime: new Date().toISOString(),
          resTime: new Date().toISOString(),
        },
      });
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
      "",
    );
  }

  async enquiry({ customer, data, kycdataId }: processPayload) {
    const cachedKey = `KRA:${customer.id}-${kycdataId}`;
    const lastTask = await cacheStorage.get(cachedKey);
    console.log("KRA ENQUIRY", lastTask);
    const reqTime = new Date().toISOString();
    const payload = {
      pan: data.step_1.pan.panCardNo,
      dob: data.step_1.pan.dateOfBirth.split("T")[0]?.toString() || "",
      mobile: kraMobNo,
      reqNo: this.generateReqNo(),
    };

    const enquiry = await this.kraInstance.panInquiryTwo(payload);
    const kraStatus =
      (lastTask || "INIT") +
      "_" +
      "ENQUIRY" +
      "_" +
      (enquiry?.APP_RES_ROOT?.APP_PAN_INQ?.APP_UPDT_STATUS ||
        enquiry?.APP_RES_ROOT?.APP_PAN_INQ?.APP_STATUS ||
        enquiry?.APP_RES_ROOT?.APP_PAN_INQ?.ERROR);

    const resTime = new Date().toISOString();
    await db.dataBase.customerProfileDataModel.update({
      where: {
        id: customer.id,
      },
      data: {
        kraStatus: kraStatus,
      },
    });

    await db.dataBase.kraDataLogs.create({
      data: {
        requestData: payload,
        responseData: enquiry,
        userId: customer.id,
        kycId: kycdataId,
        stage: kraStatus,
        reqTime,
        resTime,
      },
    });

    return enquiry;
  }

  async downloadKraReport({ customer, data, kycdataId }: processPayload) {
    const kraCachedKey = `KRA_DOWNLOAd:${customer.id}-${kycdataId}`;
    const TTL_72_HOURS = 72 * 60 * 60; // seconds = 100,800
    const reqTime = new Date().toISOString();

    const payload = {
      dob: formatDate(new Date(data.step_1.pan.dateOfBirth)).replaceAll(
        "-",
        "",
      ),
      pan: data.step_1.pan.panCardNo.split("-").reverse().join(""),
      mobile: kraMobNo,
      reqNo: this.generateReqNo(),
    };

    const report = await this.kraInstance.panDownloadDetailsComplete(payload);
    await cacheStorage.set(kraCachedKey, report, TTL_72_HOURS); // 28 Hr

    const kraStatus = `DOWNLOAD_KRA`;

    const resTime = new Date().toISOString();
    await db.dataBase.customerProfileDataModel.update({
      where: {
        id: customer.id,
      },
      data: {
        kraStatus: kraStatus,
      },
    });
    await db.dataBase.kraDataLogs.create({
      data: {
        requestData: payload,
        responseData: report,
        userId: customer.id,
        kycId: kycdataId,
        stage: kraStatus,
        reqTime,
        resTime,
      },
    });
    console.log("KRA DOWNLOADED");
    return report;
  }

  async register({ customer, data, kycdataId }: processPayload) {
    const reqTime = new Date().toISOString();
    const payload = this.buildRegisterPayload(data, customer);
    const cachedKey = `KRA:${customer.id}-${kycdataId}`;
    const report = await this.kraInstance.panRegisterUploadKraXML(payload);
    const kraStatus =
      "REGISTER_" + report?.APP_RES_ROOT?.APP_PAN_INQ?.APP_STATUS;
    const resTime = new Date().toISOString();

    await db.dataBase.customerProfileDataModel.update({
      where: {
        id: customer.id,
      },
      data: {
        kraStatus: kraStatus,
      },
    });

    await db.dataBase.kraDataLogs.create({
      data: {
        requestData: payload,
        responseData: report as object,
        userId: customer.id,
        kycId: kycdataId,
        stage: kraStatus,
        reqTime,
        resTime,
      },
    });

    if (report.APP_RES_ROOT.APP_PAN_INQ.APP_STATUS == "7") {
      await cacheStorage.set(cachedKey, "REGISTER", TTL_72_HOURS); // 28 Hr
      console.log("KRA REGISTER SUBMITTED");
    }

    return report;
  }

  async modify({ customer, data, kycdataId }: processPayload) {
    const reqTime = new Date().toISOString();
    const cachedKey = `KRA:${customer.id}-${kycdataId}`;
    // const FLASG_KEY = cachedKey + "_IPV";
    // const IPV_FLAG: string = (await cacheStorage.get(FLASG_KEY)) || "E";

    // const kraCachedKey = `KRA_DOWNLOAd:${customer.id}-${kycdataId}`;

    // const downloadedReport: T_APP_PAN_INQ_DOWNLOAD | null =
    //   await cacheStorage.get(kraCachedKey);

    const payload = this.buildRegisterPayload(data, customer, true);

    const p = payload.APP_PAN_INQ;

    const dataKraPayload: PanModifyKraPayload = {
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
        APP_DATE: formatDateTime15SecPrev(new Date()),
        APP_DOB_DT: p.APP_DOB_DT + " 00:00:00",
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
        APP_IPV_FLAG: "E",
        APP_KYC_MODE: p.APP_KYC_MODE,
        APP_REGNO: p.APP_REGNO,
        APP_DOI_DT: p.APP_DOI_DT,
        APP_COMMENCE_DT: p.APP_COMMENCE_DT,
        APP_OTH_NATIONALITY: p.APP_OTH_NATIONALITY,
        APP_MOBILE_NO: env.KRA_MOB_NO,
        APP_MOB_NO: removeCountryCode(data?.user?.phoneNo || customer?.phoneNo),
        APP_NAME: p.APP_NAME,
        APP_NATIONALITY: p.APP_NATIONALITY,
        APP_NO: p.APP_NO,
        APP_OCC: p.APP_OCC,
        APP_OTH_OCC: p.APP_OTH_OCC,
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
        APP_BRANCH_CODE: p.APP_BRANCH_CODE,
        APP_NETWRTH: p.APP_NETWRTH,
        APP_NETWORTH_DT: p.APP_NETWORTH_DT,
        APP_INCORP_PLC: p.APP_INCORP_PLC,
        APP_OTHERINFO: p.APP_OTHERINFO,
        APP_FILLER1: p.APP_FILLER1,
        APP_FILLER2: p.APP_FILLER2,
        APP_FILLER3: p.APP_FILLER3,
        APP_COMP_STATUS: p.APP_COMP_STATUS,
        APP_DNLDDT: "",
        APP_DUMP_TYPE: p.APP_DUMP_TYPE,
        APP_KRA_INFO: p.APP_KRA_INFO,
        APP_SIGNATURE: p.APP_SIGNATURE,
        APP_FATCA_COUNTRY_RES: p.APP_FATCA_COUNTRY_RES,
        APP_FAX_NO: p.APP_FAX_NO,
        APP_INTERNAL_REF: p.APP_INTERNAL_REF,
        APP_OTH_COMP_STATUS: p.APP_OTH_COMP_STATUS,
        APP_RES_STATUS_PROOF: p.APP_RES_STATUS_PROOF,
        APP_OFF_NO: p.APP_OFF_NO,
        APP_RES_NO: p.APP_RES_NO,
      },
      fatcaAdditionalDetails: payload.FATCA_ADDL_DTLS,
    };

    const report = await this.kraInstance.panModifyKraXML(dataKraPayload);
    if (report?.APP_RES_ROOT?.APP_PAN_INQ?.APP_STATUS == "01") {
      await cacheStorage.set(cachedKey, "MODIFY", TTL_72_HOURS);
      console.log("KRA MODIFY SUBMITTED");
    }

    console.log("KRA MODIFY REPORT", report);

    const resTime = new Date().toISOString();

    const kraStatus =
      "MODIFY_" +
      ((
        report?.APP_RES_ROOT?.APP_PAN_INQ?.APP_STATUS_DESC as { ERROR?: string }
      )?.ERROR ||
        report?.APP_RES_ROOT?.APP_PAN_INQ?.APP_STATUS_DESC ||
        report?.APP_RES_ROOT?.APP_PAN_INQ?.APP_STATUS ||
        report?.APP_RES_ROOT?.APP_PAN_INQ?.ERROR ||
        "REQUEST");

    await db.dataBase.kraDataLogs.create({
      data: {
        requestData: dataKraPayload as object,
        responseData: report as object,
        userId: customer.id,
        kycId: kycdataId,
        stage: kraStatus,
        reqTime,
        resTime,
      },
    });
    await db.dataBase.customerProfileDataModel.update({
      where: {
        id: customer.id,
      },
      data: {
        kraStatus: kraStatus,
      },
    });

    return report;
  }

  buildRegisterPayload(
    data: Root,
    customer: CustomerProfileDataModel,
    isModify: boolean = false,
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
        3,
      ),
    );

    const porAddress = splitAddressInto3BalancedLines(
      removeLastCommaChunks(
        data.step_1.pan.response.details.aadhaar.permanent_address_details
          .address,
        3,
      ),
    );

    const appPanInq = {
      APP_IOP_FLG: isModify ? "II" : "IE",
      APP_POS_CODE: env.KRA_OKRA_CD_MI_ID || "",

      APP_TYPE: "I",
      APP_NO: "",
      APP_DATE: formatDateTime(new Date()),
      APP_PAN_NO: panNo,
      APP_PANEX_NO: "",
      APP_PAN_COPY: "N",
      APP_EXMT: "N",
      APP_EXMT_CAT: "",
      APP_KYC_MODE: "5",
      APP_EXMT_ID_PROOF: "02",
      APP_IPV_FLAG: "E",
      APP_IPV_DATE: "",
      APP_GEN: data.step_1.pan.response.details.aadhaar.gender,
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
        "0",
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
        data.step_1.pan.response.details.aadhaar.current_address_details.state,
      )?.code,

      APP_COR_CTRY: getKraCountry("india")?.code,
      APP_OTH_COR_STATE: isModify
        ? getKraCountry(
          data.step_1.pan.response.details.aadhaar.current_address_details
            .state,
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
        data?.step_1?.pan?.response?.details?.aadhaar?.permanent_address_details
          ?.district_or_city,
      APP_PER_PINCD:
        data?.step_1?.pan?.response?.details?.aadhaar?.permanent_address_details
          .pincode,
      APP_PER_STATE: getKraState(
        data?.step_1?.pan?.response?.details?.aadhaar?.permanent_address_details
          .state,
      )?.code,
      APP_OTH_PER_STATE: "",
      APP_PER_CTRY: getKraCountry("india")?.code,
      APP_PER_ADD_PROOF: "31",
      APP_PER_ADD_REF:
        data?.step_1?.pan?.response?.details?.aadhaar?.id_number?.replaceAll(
          "x",
          "",
        ) || "",
      APP_PER_ADD_DT: "",
      APP_INCOME: "",
      APP_OCC:
        occCode[data.step_2.occupationType as keyof typeof occCode] || "",
      APP_OTH_OCC: data.step_2?.otherOccupationName || "",
      APP_POL_CONN: "NA",
      APP_DOC_PROOF: "T",
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

  // Format in IST using formatToParts (reliable)
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find(p => p.type === type)?.value ?? "";

  const dd = get("day");
  const mm = get("month");
  const yyyy = get("year");
  const HH = get("hour");
  const MM = get("minute");
  const SS = get("second");

  return `${dd}-${mm}-${yyyy} ${HH}:${MM}:${SS}`;
}

export function formatDateTime15SecPrev(date: Date): string {
  // If PROD should behave differently, keep this condition
  if (env.KRA_ENV === "PROD") return formatDateTime(date);

  // subtract 15 seconds from the actual instant
  const d = new Date(date.getTime() - 15_000);

  // Format in IST using formatToParts (reliable)
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) => parts.find(p => p.type === type)?.value ?? "";

  const dd = get("day");
  const mm = get("month");
  const yyyy = get("year");
  const HH = get("hour");
  const MM = get("minute");
  const SS = get("second");

  return `${dd}-${mm}-${yyyy} ${HH}:${MM}:${SS}`;
}