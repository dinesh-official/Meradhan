import { db, type CustomerProfileDataModel } from "@core/database/database";
import { env } from "@packages/config/env";
import { KraSDK } from "kyc-providers";
import type { Root } from "../../../../packages/kyc-providers/pdf/dataMapper";
import type { KraWorkerJobData } from "./kraWroker.helper";

export class KraWorkerService {
  // kra worker methods here
  static async processKra(data: KraWorkerJobData) {
    const { customerId, kycDataStoreId } = data;
    const customer = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
    });
    if (customer) {
      throw new Error("Customer not found");
    }
    const payload = await db.dataBase.kYC_FLOW.findUnique({
      where: { id: kycDataStoreId, userID: customerId },
    });

    const kyc = payload?.data as Root;

    const res = await KraProcess.enquiry(kycDataStoreId, kyc, customer!);
    console.log(res);
    // Add your processing logic here
  }
}

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

  static async enquiry(
    kycdataId: number,
    data: Root,
    customer: CustomerProfileDataModel
  ) {
    // Implement the KRA processing logic here
    const payload = {
      dob: data.step_1.pan.dateOfBirth,
      pan: data.step_1.pan.panCardNo.split("-").reverse().join(""),
      mobile: customer.phoneNo!.replaceAll("+", "")!,
      reqNo: this.generateReqNo(),
    };
    const enquiry = await this.kraInstance.panInquiry(payload);
    await db.dataBase.kraDataLogs.create({
      data: {
        requestData: payload,
        responseData: enquiry,
        userId: customer.id,
        kycId: kycdataId,
        stage: "ENQUIRY_KRA",
      },
    });

    return enquiry;
  }

  static async downloadKraReport(
    kycdataId: number,
    data: Root,
    customer: CustomerProfileDataModel
  ) {
    const payload = {
      dob: data.step_1.pan.dateOfBirth,
      pan: data.step_1.pan.panCardNo.split("-").reverse().join(""),
      mobile: customer.phoneNo!.replaceAll("+", "")!,
      reqNo: this.generateReqNo(),
    };

    const report = await this.kraInstance.panDownloadDetailsComplete(payload);
    await db.dataBase.kraDataLogs.create({
      data: {
        requestData: payload,
        responseData: report,
        userId: customer.id,
        kycId: kycdataId,
        stage: "DOWNLOAD_KRA",
      },
    });
    return report;
  }
}
