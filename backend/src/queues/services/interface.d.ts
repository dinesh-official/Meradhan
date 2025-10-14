import type { Job, JobsOptions } from "bullmq";
import type { QueueNames } from "../redis/queues";


export interface IQueueJobService {
  createJob<T>(name: QueueNames, data: T, options?: JobsOptions): Promise<Job<T>>;
  updateJob<T>(jobId: string, newData: T): Promise<Job<T> | null>;
  cancelJob(jobId: string): Promise<boolean>;
  getJob<T>(jobId: string): Promise<Job<T> | null>;
  close(): Promise<void>;
}
