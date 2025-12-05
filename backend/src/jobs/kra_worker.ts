import type { Job } from "bull";
import { startQueueWorker } from "./helper/start_queue_worker_helper";
import { kraWorkerQueue } from "./queue/worker_queues";
import { KraWorkerService } from "./kra_worker/KraWorker.service";

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
        `KRA Worker Job with ID ${job.id} has failed with error: ${err.message}`
      );
    },
    onError(err) {
      console.error(`KRA Worker Queue encountered an error: ${err.message}`);
    },
  }
);
