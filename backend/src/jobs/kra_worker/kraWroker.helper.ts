import { kraWorkerQueue } from "@jobs/queue/worker_queues";

export interface KraWorkerJobData<T = Record<string, unknown>> {
  customerId: number;
  kycDataStoreId: number;
  stage: "ENQUIRY_KRA" | "REGISTER_KRA" | "DOWNLOAD_KRA" | "MODIFY_KRA";
  data?: T;
}

export const addKraWorkerJob = async <T>(data: KraWorkerJobData<T>) => {
  return await kraWorkerQueue.add(data, {
    attempts: 1,
    // backoff: {
    //   type: "exponential",
    //   delay: 2000, // initial delay, grows: 2000, 4000, 8000, etc.
    // },
  });
};
