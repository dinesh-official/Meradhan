// // import { addKraWorkerJob } from "@jobs/kra_worker/kraWroker.helper";
// // import { cacheStorage } from "@store/redis_store";

import { orderSettlementQueue } from "@jobs/queue/worker_queues";

// import { checkKraProcessCheckStatus } from "@jobs/kra_worker/CheckKraStatus";

// // const user = { userId: 50, kycId: 254 };

// // const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// // const main = async () => {
// //   await cacheStorage.delete(`KRA:${user.userId}-${user.kycId}`)
// //     .then(async () => {
// //       console.log("Processing user ${user.userId} with kycId ${user.kycId}...");
// //       await addKraWorkerJob(
// //         {
// //           customerId: user.userId,
// //           kycDataStoreId: user.kycId,
// //           stage: "ENQUIRY_KRA",
// //         },
// //         5000,
// //       );
// //       await delay(3000);
// //       console.log(`Added job for user ${user.userId} with kycId ${user.kycId}`);
// //     });
// //   console.log("All jobs added successfully");
// // };

// // main();

// const test = checkKraProcessCheckStatus({
//   APP_RES_ROOT: {
//     APP_PAN_INQ: {
//       APP_NAME: "Kamal Sarin",
//       APP_PAN_NO: "APWPS0695A",
//       APP_REQ_NO: "185890001",
//       APP_RES_NO: "1362867155",
//       APP_STATUS: "KYC validated at KARVY",
//       APP_IPV_FLAG: "Y",
//       APP_KYC_MODE: "1",
//       APP_STATUSDT: "05-07-2013",
//       APP_UPDT_RMKS: "",
//       APP_UPDT_STATUS: "rejected at KARVY",
//       APP_HOLD_DEACTIVE_RMKS: ""
//     }
//   }
// }, "MODIFY"); // MODIFY or REGISTER our end task

// console.log(test);
// process.exit(0);


(async () => {
  try {
    const job = await orderSettlementQueue.add({ id: 123, type: "orderSettlement" });
    console.log("job added", job.id);
  } catch (err) {
    console.error("Failed to add job:", err);
    process.exit(1);
  }
  process.exit(0);
})();