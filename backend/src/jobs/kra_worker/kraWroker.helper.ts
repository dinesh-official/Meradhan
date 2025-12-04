import { kraWorkerQueue } from "@jobs/queue/worker_queues";

export interface KraWorkerJobData<T = Record<string, unknown>> {
  customerId: number;
  kycDataStoreId: number;
  stage: "ENQUIRY_KRA" | "REGISTER_KRA" | "DOWNLOAD_KRA" | "MODIFY_KRA";
  data?: T;
}

export const addKraWorkerJob = async <T>(
  data: KraWorkerJobData<T>,
  delay?: number
) => {
  return await kraWorkerQueue.add(data, {
    attempts: 1,
    backoff: {
      type: "exponential",
      delay: delay ?? 2 * 60 * 60 * 1000, // initial delay, 2 hr
    },
  });
};
