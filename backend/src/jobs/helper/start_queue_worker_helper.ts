import logger from "@utils/logger/logger";
import Bull from "bull";

export const startQueueWorker = (
  queue: Bull.Queue,
  processor: (job: Bull.Job) => Promise<void>,
  concurrency: number = 50,
  options?: {
    onCompleted?: (job: Bull.Job) => void;
    onFailed?: (job: Bull.Job, err: Error) => void;
    onError?: (err: Error) => void;
  }
) => {
  logger.logInfo(`🚀 Starting worker for queue: ${queue.name}`);

  // Process jobs using the provided processor function
  queue.process(concurrency, async (job) => {
    try {
      await processor(job);
    } catch (err) {
      console.log("Error Here");

      logger.logError(`❌ Job ${job.id} failed:`, err);
      throw err; // Bull will handle retries if configured
    }
  });

  // Event listeners
  queue.on("completed", (job) => {
    logger.logInfo(`✅ Job ${job.id} completed successfully`);
    if (options?.onCompleted) {
      options.onCompleted(job);
    }
  });

  queue.on("failed", (job, err) => {
    logger.logError(`❌ Job ${job?.id} failed:`, err);
    if (options?.onFailed) {
      options.onFailed(job, err);
    }
  });

  queue.on("error", (err) => {
    logger.logError(`Queue "${queue.name}" error:`, err);
    if (options?.onError) {
      options.onError(err);
    }
  });
};
