import {
  kraWorkerQueue,
  profileSubmitSettlementQueue,
} from "@jobs/queue/worker_queues";
import { cacheStorage } from "@store/redis_store";

export interface KraWorkerJobData<T = Record<string, unknown>> {
  customerId: number;
  kycDataStoreId: number;
  stage: "ENQUIRY_KRA" | "REGISTER_KRA" | "DOWNLOAD_KRA" | "MODIFY_KRA";
  data?: T;
}

export const addKraWorkerJob = async <T>(
  data: KraWorkerJobData<T>,
  delay?: number,
) => {
  const TTL_72_HOURS = 72 * 60 * 60; // 72 hours
  const cachedKey = `KRA:${data.customerId}-${data.kycDataStoreId}-RUNNER`;
  const runner = await cacheStorage.get<string>(cachedKey);

  if (!runner) {
    await cacheStorage.set(cachedKey, new Date().toISOString(), TTL_72_HOURS); // 72 hours
  }

  return await kraWorkerQueue.add(data, {
    attempts: 1,
    delay: delay ?? 4 * 60 * 60 * 1000, // initial delay, 4 hr
  });
};

export const addCompleteCustomerKycProfile = async (id: number) => {
  return await profileSubmitSettlementQueue.add(
    { id },
    {
      attempts: 1,
      delay: 2 * 60 * 1000, // 5 minutes
    },
  );
};
