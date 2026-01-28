import { addKraWorkerJob } from "@jobs/kra_worker/kraWroker.helper";
import { cacheStorage } from "@store/redis_store";

const user = { userId: 50, kycId: 254 };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  await cacheStorage
    .delete(`KRA:${user.userId}-${user.kycId}`)
    .then(async () => {
      console.log("Processing user ${user.userId} with kycId ${user.kycId}...");
      await addKraWorkerJob(
        {
          customerId: user.userId,
          kycDataStoreId: user.kycId,
          stage: "ENQUIRY_KRA",
        },
        5000,
      );
      await delay(3000);
      console.log(`Added job for user ${user.userId} with kycId ${user.kycId}`);
    });
  console.log("All jobs added successfully");
};

main();
