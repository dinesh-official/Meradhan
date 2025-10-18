import logger from "@utils/logger/logger";
import Bull from "bull";

export const startQueueWorker = (
    queue: Bull.Queue,
    processor: (job: Bull.Job) => Promise<void>,
) => {
    logger.logInfo(`🚀 Starting worker for queue: ${queue.name}`);

    // Process jobs using the provided processor function
    queue.process(async (job) => {
        try {
            await processor(job);
        } catch (err) {
            logger.logError(`❌ Job ${job.id} failed:`, err);
            throw err; // Bull will handle retries if configured
        }
    });

    // Event listeners
    queue.on("completed", (job) => {
        logger.logInfo(`✅ Job ${job.id} completed successfully`);
    });

    queue.on("failed", (job, err) => {
        logger.logError(`❌ Job ${job?.id} failed:`, err);
    });

    queue.on("error", (err) => {
        logger.logError(`Queue "${queue.name}" error:`, err);
    });
};
