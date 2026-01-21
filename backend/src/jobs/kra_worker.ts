import type { Job } from "bull";
import { startQueueWorker } from "./helper/start_queue_worker_helper";
import {
  kraWorkerQueue,
  profileSubmitSettlementQueue,
} from "./queue/worker_queues";
import { KraWorkerService } from "./kra_worker/KraWorker.service";
import { CustomerKycManager } from "@services/customer/kyc/customer_kyc_manager.service";

startQueueWorker(
  kraWorkerQueue,
  async (job: Job) => {
    const kraWorkerService = new KraWorkerService();
    await kraWorkerService.processKra(job.data);
    console.log(job.data);
  },
  1,
  {
    onCompleted(job) {
      console.log(`KRA Worker Job with ID ${job.id} has been completed.`);
    },
    onFailed(job, err) {
      console.error(
        `KRA Worker Job with ID ${job.id} has failed with error: ${err.message}`,
      );
    },
    onError(err) {
      console.error(`KRA Worker Queue encountered an error: ${err.message}`);
    },
  },
);

startQueueWorker(
  profileSubmitSettlementQueue,
  async (job: Job) => {
    const kycManager = new CustomerKycManager();
    await kycManager.saveKycToCustomer(Number(job.data.id));
  },
  1,
  {
    onCompleted(job) {
      console.log(
        `Profile Set Worker Job with ID ${job.id} has been completed.`,
      );
    },
    onFailed(job, err) {
      console.error(
        `Profile Worker Job with ID ${job.id} has failed with error: ${err.message}`,
      );
    },
    onError(err) {
      console.error(
        `Profile Worker Queue encountered an error: ${err.message}`,
      );
    },
  },
);
