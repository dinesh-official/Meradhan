import { addKraWorkerJob } from "@jobs/kra_worker/kraWroker.helper";
import { cacheStorage } from "@store/redis_store";

const user = {
  "userId": 92,
  "kycId": 617,
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  const cachedKey = `KRA:${user.userId}-${user.kycId}`;
  const pastExecution = "MODIFY"; // MODIFY , REGISTER

  await cacheStorage.delete(cachedKey).then(async () => {
    if (pastExecution && pastExecution.length !== 0) {
      await cacheStorage.set(cachedKey, pastExecution, 72 * 60 * 60);
    }

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