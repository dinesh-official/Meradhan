import { Worker, Job } from "bullmq";
import { QueueStore } from "../src/queues/redis/QueueStore";
import type { QueueNames } from "../src/queues/redis/queues";
import logger from "@utils/logger/logger";

export const startQueueWorker = (
    queueName: QueueNames,
    processor: (job: Job) => Promise<void>,
    concurrency = 100
) => {
    const redis = QueueStore.prototype.getInstance();
    const worker = new Worker(queueName, processor, {
        connection: redis,
        concurrency,
        removeOnComplete: {
            count: 0,
        }
    });

    // Event listeners
    worker.on("completed", (job) => {
        logger.logInfo(`✅ Job "${job.name}" (ID: ${job.id}) completed`);
    });

    worker.on("failed", (job, err) => {
        logger.logError(`❌ Job "${job?.name}" (ID: ${job?.id}) failed:`, { job, err });
    });

    worker.on("active", (job) => {
        logger.logInfo(`🚀 Started processing job "${job.name}" (ID: ${job.id})`);
    });

    logger.logInfo(`⚙️ Worker started for queue: "${queueName}"`);

    // Optional graceful shutdown helper
    const close = async () => {
        await worker.close();
        logger.logInfo(`👋 Worker closed for queue "${queueName}"`);
    };

    return { worker, close };
};
