import { addKraWorkerJob } from "@jobs/kra_worker/kraWroker.helper";

await addKraWorkerJob(
  {
    customerId: 45,
    kycDataStoreId: 217,
    stage: "ENQUIRY_KRA",
  },
  0,
);
console.log("JOB ADDED");
