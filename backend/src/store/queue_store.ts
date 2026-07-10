import { env } from "@packages/config/env";
import logger from "@utils/logger/logger";
import { Redis } from "ioredis";

export class QueueStore {
  private static instance: Redis | null = null;
  private static store: QueueStore | null = null;

  private constructor() {}

  public static getStore(): QueueStore {
    if (!QueueStore.store) {
      QueueStore.store = new QueueStore();
    }
    return QueueStore.store;
  }

  public getInstance(): Redis {
    if (!QueueStore.instance) {
      const redis = new Redis({
        username: env.REDIS_USERNAME,
        password: env.REDIS_PASSWORD,
        host: env.REDIS_HOST,
        port: Number(env.REDIS_PORT),
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
      redis.on("connect", () => logger.logInfo("🟢 Redis is connecting..."));
      redis.on("ready", () =>
        logger.logInfo("✅ Redis connection established and ready to use.")
      );
      redis.on("error", (err) =>
        logger.logError("🔴 Redis connection error:", err)
      );
      redis.on("end", () => logger.logInfo("⚪️ Redis connection closed."));

      QueueStore.instance = redis;
    }
    return QueueStore.instance;
  }

  public async checkConnection(): Promise<boolean> {
    try {
      const pong = await this.getInstance().ping();
      logger.logInfo("Redis PING response:", pong);
      return pong === "PONG";
    } catch (error) {
      logger.logError("Redis not connected:", error);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    if (!QueueStore.instance) {
      logger.logInfo("⚪️ No Redis connection to close.");
      return;
    }

    try {
      await QueueStore.instance.quit();
      logger.logInfo("👋 Redis connection closed gracefully.");
    } catch (error) {
      logger.logError("❌ Error while disconnecting Redis:", error);
      QueueStore.instance.disconnect();
    } finally {
      QueueStore.instance = null;
    }
  }

  public async setKey<T>(
    key: string,
    value: T,
    ttlSeconds?: number
  ): Promise<void> {
    const redis = this.getInstance();
    const json = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.set(key, json, "EX", ttlSeconds);
    } else {
      await redis.set(key, json);
    }
    logger.logInfo(`✅ Set key "${key}"`);
  }

  public async getKey<T>(key: string): Promise<T | null> {
    const redis = this.getInstance();
    const data = await redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      logger.logInfo(
        `⚠️ Could not parse key "${key}" as JSON. Returning raw string.`
      );
      return data as unknown as T;
    }
  }

  public async updateKey<T>(key: string, value: T): Promise<boolean> {
    const redis = this.getInstance();
    const exists = await redis.exists(key);
    if (!exists) {
      logger.logInfo(`⚠️ Cannot update key "${key}" — it does not exist.`);
      return false;
    }
    await redis.set(key, JSON.stringify(value));
    logger.logInfo(`🔄 Updated key "${key}"`);
    return true;
  }

  public async deleteKey(key: string): Promise<boolean> {
    const redis = this.getInstance();
    const deleted = await redis.del(key);
    if (deleted > 0) {
      logger.logInfo(`🗑️ Deleted key "${key}"`);
      return true;
    } else {
      logger.logInfo(`⚠️ Key "${key}" not found.`);
      return false;
    }
  }
}
