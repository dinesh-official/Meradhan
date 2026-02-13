import { addKraWorkerJob } from "@jobs/kra_worker/kraWroker.helper";
import { cacheStorage } from "@store/redis_store";

const user = {
  "userId": 66,
  "kycId": 431,
};

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  try {
    const cacheKey = `KRA:${user.userId}-${user.kycId}`;
    // Set new cache state
    await cacheStorage.set(cacheKey, "MODIFY", 72 * 60 * 60);

    console.log(`Processing user ${user.userId} with kycId ${user.kycId}...`,);

    // Add worker job
    await addKraWorkerJob(
      {
        customerId: user.userId,
        kycDataStoreId: user.kycId,
        stage: "MODIFY_KRA",
      },
      5000,
    );

    // Optional delay (if actually needed)
    await delay(3000);

    console.log(
      `Added job for user ${user.userId} with kycId ${user.kycId}`,
    );

    console.log("All jobs added successfully");
  } catch (error) {
    console.error("Failed to add KRA job:", error);
  }
};

main();
