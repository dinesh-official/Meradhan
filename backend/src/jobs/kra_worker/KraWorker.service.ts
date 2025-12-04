import { db, type CustomerProfileDataModel } from "@core/database/database";
import { env } from "@packages/config/env";
import { KraSDK } from "kyc-providers";
import type {
  T_APP_PAN_INQ,
  T_APP_PAN_REGISTER_REQUEST_PAYLOAD,
} from "kyc-providers";
import type { Root } from "../../../../packages/kyc-providers/pdf/dataMapper";
import { addKraWorkerJob, type KraWorkerJobData } from "./kraWroker.helper";
import { removeCountryCode } from "@utils/filters/convert";
import { makeFullname } from "@utils/generate/generate_username";
import { checkKraProcessCheckStatus } from "./CheckKraStatus";

function stageFunctions(stage: KraWorkerJobData["stage"]) {
  switch (stage) {
    case "ENQUIRY_KRA":
      return KraProcess.enquiry;
    case "DOWNLOAD_KRA":
      return KraProcess.downloadKraReport;
    case "REGISTER_KRA":
      return KraProcess.register;
    case "MODIFY_KRA":
      return KraProcess.modify;
    default:
      throw new Error("Invalid stage");
  }
}

export class KraWorkerService {
  // kra worker methods here
  static async processKra(data: KraWorkerJobData) {
    const { customerId, kycDataStoreId } = data;
    try {
      console.log("KRA Worker job:", data);

      const customer = await db.dataBase.customerProfileDataModel.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        throw new Error("Customer not found");
      }

      // findFirst allows using both id and userID in the where clause
      const payload = await db.dataBase.kYC_FLOW.findFirst({
        where: { id: kycDataStoreId, userID: customerId },
      });

      if (!payload) {
        throw new Error("KYC payload not found or does not belong to user");
      }

      const kyc = payload.data as Root;
      console.log("KYC payload:", kyc?.step_1?.pan?.panCardNo);

      const res = await stageFunctions("ENQUIRY_KRA")({
        kycdataId: kycDataStoreId,
        data: kyc,
        customer,
      });

      const status = checkKraProcessCheckStatus(res as T_APP_PAN_INQ);
      // Reschedule the job next 2 hours later
      if (status == "WAITING") {
        await addKraWorkerJob(data);
        return;
      }

      // If status is REGISTER then register the KRA again check status 2 hours later
      if (status == "REGISTER") {
        await stageFunctions("REGISTER_KRA")({
          kycdataId: kycDataStoreId,
          data: kyc,
          customer,
        });
        await addKraWorkerJob(data);
        return;
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

class KraProcess {
  private static kraInstance = new KraSDK({
    okraCdOrMiId: env.KRA_OKRA_CD_MI_ID,
    passKey: env.KRA_PASS_KEY,
    password: env.KRA_PASSWORD,
    userName: env.KRA_USERNAME,
    env: env.KRA_ENV,
  });

  private static counter = 0;

  private static generateReqNo() {
    const base = Date.now() % 10_000_000;
    this.counter = (this.counter + 1) % 1000;
    return `${base}${this.counter.toString().padStart(3, "0")}`;
  }

  static async enquiry({ customer, data, kycdataId }: processPayload) {
    // Implement the KRA processing logic here
    const reqTime = new Date().toISOString();
    const payload = {
      pan: data.step_1.pan.panCardNo.split("-").reverse().join(""),
      dob: data.step_1.pan.dateOfBirth,
      mobile: removeCountryCode(customer.phoneNo),
      reqNo: this.generateReqNo(),
    };
    const enquiry = await this.kraInstance.panInquiry(payload);
    const resTime = new Date().toISOString();
    await db.dataBase.kraDataLogs.create({
      data: {
        requestData: payload,
        responseData: enquiry,
        userId: customer.id,
        kycId: kycdataId,
        stage: "ENQUIRY_KRA",
        reqTime,
        resTime,
      },
    });

    return enquiry;
  }

  static async downloadKraReport({
    customer,
    data,
    kycdataId,
  }: processPayload) {
    const reqTime = new Date().toISOString();
    const payload = {
      dob: data.step_1.pan.dateOfBirth,
      pan: data.step_1.pan.panCardNo.split("-").reverse().join(""),
      mobile: customer.phoneNo!.replaceAll("+", "")!,
      reqNo: this.generateReqNo(),
    };

    const report = await this.kraInstance.panDownloadDetailsComplete(payload);
    const resTime = new Date().toISOString();
    await db.dataBase.kraDataLogs.create({
      data: {
        requestData: payload,
        responseData: report,
        userId: customer.id,
        kycId: kycdataId,
        stage: "DOWNLOAD_KRA",
        reqTime,
        resTime,
      },
    });
    return report;
  }

  static async register({ customer, data, kycdataId }: processPayload) {
    const reqTime = new Date().toISOString();
    const payload = KraProcess.buildRegisterPayload(data, customer);

    const report = await this.kraInstance.panRegisterUploadKraXML(payload);
    const resTime = new Date().toISOString();
    await db.dataBase.kraDataLogs.create({
      data: {
        requestData: payload,
        responseData: report as object,
        userId: customer.id,
        kycId: kycdataId,
        stage: "REGISTER_KRA",
        reqTime,
        resTime,
      },
    });
    return report;
  }

  static async modify({ customer, data, kycdataId }: processPayload) {
    const reqTime = new Date().toISOString();
    const payload = KraProcess.buildRegisterPayload(data, customer);

    const report = await this.kraInstance.panRegisterUploadKraXML(payload);
    const resTime = new Date().toISOString();

    await db.dataBase.kraDataLogs.create({
      data: {
        requestData: payload,
        responseData: report as object,
        userId: customer.id,
        kycId: kycdataId,
        stage: "MODIFY_KRA",
        reqTime,
        resTime,
      },
    });
    return report;
  }

  private static buildRegisterPayload(
    data: Root,
    customer: CustomerProfileDataModel
  ): T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"] {
    const panRaw = data.step_1?.pan?.panCardNo || "";
    const panNo = panRaw ? panRaw.split("-").reverse().join("") : "";

    const firstName = data.step_1?.pan?.firstName || "";
    const middleName = data.step_1?.pan?.middleName || "";
    const lastName = data.step_1?.pan?.lastName || "";

    const dob = data.step_1?.pan?.dateOfBirth || "";
    const mobile = removeCountryCode(customer.phoneNo);

    const appPanInq = {
      APP_IOP_FLG: "IE",
      APP_POS_CODE: env.KRA_OKRA_CD_MI_ID || "",
      APP_TYPE: "I",
      APP_NO: "",
      APP_DATE: new Date().toISOString(),
      APP_PAN_NO: panNo,
      APP_PANEX_NO: "",
      APP_PAN_COPY: "Y",
      APP_EXMT: "N",
      APP_EXMT_CAT: "",
      APP_KYC_MODE: "5",
      APP_EXMT_ID_PROOF: "02",
      APP_IPV_FLAG: "E",
      APP_IPV_DATE: formatDate(new Date()),
      APP_GEN: data.step_1.pan.response.details.pan.gender,
      APP_NAME: makeFullname({ firstName, middleName, lastName }),

      APP_F_NAME: firstName,
      APP_REGNO: "",
      APP_DOB_DT: formatDate(new Date(dob)),
      APP_DOI_DT: "",
      APP_COMMENCE_DT: "",
      APP_NATIONALITY: "",
      APP_OTH_NATIONALITY: "",
      APP_COMP_STATUS: "",
      APP_OTH_COMP_STATUS: "",
      APP_RES_STATUS: "",
      APP_RES_STATUS_PROOF: "",
      APP_UID_NO: data.step_1?.pan?.response?.details?.aadhaar?.id_number || "",
      APP_COR_ADD1: "",
      APP_COR_ADD2: "",
      APP_COR_ADD3: "",
      APP_COR_CITY:
        data.step_1.pan.response.details.aadhaar.permanent_address_details
          .district_or_city,
      APP_COR_PINCD:
        data.step_1.pan.response.details.aadhaar.permanent_address_details
          .pincode,
      APP_COR_STATE: "",
      APP_OTH_COR_STATE: "",
      APP_COR_CTRY: "",
      APP_OFF_NO: "",
      APP_RES_NO: "",
      APP_MOB_NO: mobile,
      APP_FAX_NO: "",
      APP_EMAIL: data.user?.emailAddress || customer.emailAddress || "",
      APP_COR_ADD_PROOF: "",
      APP_COR_ADD_REF: "",
      APP_COR_ADD_DT: "",
      APP_PER_ADD1: "",
      APP_PER_ADD2: "",
      APP_PER_ADD3: "",
      APP_PER_CITY: "",
      APP_PER_PINCD: "",
      APP_PER_STATE: "",
      APP_OTH_PER_STATE: "",
      APP_PER_CTRY: "",
      APP_PER_ADD_PROOF: "",
      APP_PER_ADD_REF: "",
      APP_PER_ADD_DT: "",
      APP_INCOME: data.step_2?.annualGrossIncome || "",
      APP_OCC: data.step_2?.occupationType || "",
      APP_OTH_OCC: "",
      APP_POL_CONN: "",
      APP_DOC_PROOF: "",
      APP_INTERNAL_REF: "",
      APP_BRANCH_CODE: "",
      APP_MAR_STATUS: data.step_2?.maritalStatus || "",
      APP_NETWRTH: "",
      APP_NETWORTH_DT: "",
      APP_INCORP_PLC: "",
      APP_OTHERINFO: "",
      APP_FILLER1: "",
      APP_FILLER2: "",
      APP_FILLER3: "",
      APP_DUMP_TYPE: "",
      APP_KRA_INFO: "",
      APP_SIGNATURE: data.step_4?.[0]?.response?.signature || "",
      APP_FATCA_APPLICABLE_FLAG: data.step_1?.pan?.isFatca ? "Y" : "N",
      APP_FATCA_BIRTH_PLACE: "",
      APP_FATCA_BIRTH_COUNTRY: "",
      APP_FATCA_COUNTRY_RES: "",
      APP_FATCA_COUNTRY_CITYZENSHIP: "",
      APP_FATCA_DATE_DECLARATION: "",
    };

    const appSummRec = {
      APP_REQ_DATE: new Date().toISOString(),
      APP_OTHKRA_BATCH: "",
      APP_OTHKRA_CODE: env.KRA_OKRA_CD_MI_ID || "",
      APP_TOTAL_REC: "1",
      NO_OF_FATCA_ADDL_DTLS_RECORDS: data.step_1?.pan?.isFatca ? "1" : "0",
    };

    const fatca =
      [] as T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"]["FATCA_ADDL_DTLS"];
    if (data.step_1?.pan?.isFatca) {
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
      FATCA_ADDL_DTLS: fatca,
      APP_SUMM_REC: appSummRec,
    } as T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"];
  }
}

const formatDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // January is 0!
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};
