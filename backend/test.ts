

import { addKraWorkerJob } from "@jobs/kra_worker/kraWroker.helper";
import { cacheStorage } from "@store/redis_store";
const TTL_28_HOURS = 72 * 60 * 60; // seconds = 100,800

const customerId = 49;
const kycDataStoreId = 237;

await cacheStorage.set(`KRA:${customerId}-${kycDataStoreId}`, "MODIFY", TTL_28_HOURS);


await addKraWorkerJob(
  {
    customerId,
    kycDataStoreId,
    stage: "ENQUIRY_KRA",
  }, 1000
);

console.log("DONE");
