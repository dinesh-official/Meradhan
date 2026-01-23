

// import { addKraWorkerJob } from "@jobs/kra_worker/kraWroker.helper";
// import { cacheStorage } from "@store/redis_store";
// const TTL_28_HOURS = 72 * 60 * 60; // seconds = 100,800

import { db } from "@core/database/database";
import { KraProcess } from "@jobs/kra_worker/KraWorker.service";
import { KraXMLBuilder } from "@packages/kyc-providers";
import type { Root } from "@packages/kyc-providers/pdf/dataMapper";

// const customerId = 49;
// const kycDataStoreId = 237;

// await cacheStorage.set(`KRA:${customerId}-${kycDataStoreId}`, "MODIFY", TTL_28_HOURS);


// await addKraWorkerJob(
//   {
//     customerId,
//     kycDataStoreId,
//     stage: "ENQUIRY_KRA",
//   }, 1000
// );

// console.log("DONE");

const kra = new KraProcess();


const customer = await db.dataBase.customerProfileDataModel.findUnique({
    where: { id: 105 },
});
if (!customer) throw new Error("Customer not found");

const payload = await db.dataBase.kYC_FLOW.findFirst({
    where: { id: 344, userID: 105 },
});

if (!payload) throw new Error("KYC payload not found or does not belong to user");

const kyc = payload.data as Root;

const data = new KraProcess().buildRegisterPayload(kyc, customer, true);

console.log(KraXMLBuilder.buildPanModifyKraXML({
    payload: {
        panInquiry: data,
        fatcaAdditionalDetails: data.FATCA_ADDL_DTLS,
    },
    encryptedPassword: "1234567890",
    passKey: "1234567890",
    userName: "1234567890",
}));