import { Job, Queue, type JobsOptions } from "bullmq";
import { QueueStore } from "../redis/QueueStore";
import type { QueueNames } from "../redis/queues";
import logger from "@utils/logger/logger";


/**
 * JobService manages job creation, updating, and cancellation
 * for a specific BullMQ queue.
 */
export class QueueJobService {
    private queue: Queue;

    constructor(private readonly queueName: QueueNames) {
        const redis = QueueStore.prototype.getInstance();
        this.queue = new Queue(queueName, { connection: redis });

        logger.logInfo(`📋 JobService initialized for queue: "${queueName}"`);
    }

    /**
     * Create (add) a new job to the queue.
     * @param name - The name/type of the job
     * @param data - The payload data for the job
     * @param options - Optional BullMQ job options (e.g., delay, attempts)
     */
    async createJob<T>(name: string, data: T, options?: JobsOptions): Promise<Job<T>> {
        try {
            const job = await this.queue.add(name, data, options);
            logger.logInfo(`✅ Created job "${name}" (ID: ${job.id})`);
            return job;
        } catch (error) {
            logger.logError('❌ Failed to create job:', error);
            throw error;
        }
    }

    /**
     * Update job data.
     * BullMQ doesn’t provide a direct update API, so we:
     *   1. Retrieve the job by ID
     *   2. Update its data
     *   3. Save it back
     */
    async updateJob<T>(jobId: string, newData: T): Promise<Job<T> | null> {
        try {
            const job = await Job.fromId(this.queue, jobId);
            if (!job) {
                console.warn(`⚠️ Job with ID "${jobId}" not found.`);
                return null;
            }

            job.data = newData;
            await job.updateData(newData);
            logger.logInfo(`🔄 Updated job ID "${jobId}" successfully.`);
            return job;
        } catch (error) {
            logger.logError(`❌ Failed to update job ID "${jobId}":`, error);
            return null;
        }
    }

    /**
     * Cancel (remove) a job by ID.
     * If the job is active, this will fail — use .discard() + retry if needed.
     */
    async cancelJob(jobId: string): Promise<boolean> {
        try {
            const job = await Job.fromId(this.queue, jobId);
            if (!job) {
                console.warn(`⚠️ Job with ID "${jobId}" not found.`);
                return false;
            }

            await job.remove();
            logger.logInfo(`🗑️ Canceled (deleted) job ID "${jobId}"`);
            return true;
        } catch (error) {
            logger.logError(`❌ Failed to cancel job ID "${jobId}":`, error);
            return false;
        }
    }

    /**
     * Get a job by ID.
     */
    async getJob<T>(jobId: string): Promise<Job<T> | null> {
        try {
            const job = await Job.fromId(this.queue, jobId);
            if (!job) {
                console.warn(`⚠️ Job with ID "${jobId}" not found.`);
                return null;
            }
            return job;
        } catch (error) {
            logger.logError(`❌ Failed to fetch job ID "${jobId}":`, error);
            return null;
        }
    }

    /**
     * Gracefully close the queue connection.
     */
    async close(): Promise<void> {
        await this.queue.close();
        logger.logInfo(`👋 Closed queue "${this.queueName}"`);
    }
}
