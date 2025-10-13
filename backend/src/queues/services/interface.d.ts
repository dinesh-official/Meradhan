import type Redis from "ioredis";
import type { Job, JobsOptions } from "bullmq";
import type { QueueNames } from "../redis/queues";

export interface IQueueService<T = Redis> {
  getInstance(): T;
  checkConnection(): Promise<boolean>;
  disconnect(): Promise<void>;
  setKey<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  getKey<T>(key: string): Promise<T | null>;
  updateKey<T>(key: string, value: T): Promise<boolean>;
  deleteKey(key: string): Promise<boolean>;
}

export interface IQueueJobService {
  createJob<T>(name: QueueNames, data: T, options?: JobsOptions): Promise<Job<T>>;
  updateJob<T>(jobId: string, newData: T): Promise<Job<T> | null>;
  cancelJob(jobId: string): Promise<boolean>;
  getJob<T>(jobId: string): Promise<Job<T> | null>;
  close(): Promise<void>;
}
