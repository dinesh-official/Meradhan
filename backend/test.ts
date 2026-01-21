import { addKraWorkerJob } from "@jobs/kra_worker/kraWroker.helper";
import { cacheStorage } from "@store/redis_store";
const TTL_28_HOURS = 72 * 60 * 60; // seconds = 100,800
await cacheStorage.set("KRA:45-217", "MODIFY", TTL_28_HOURS);

await addKraWorkerJob(
  {
    customerId: 45,
    kycDataStoreId: 217,
    stage: "ENQUIRY_KRA",
  },
  1000,
);

console.log("DONE");
