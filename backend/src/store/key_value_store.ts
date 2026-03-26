import { QueueStore } from './queue_store';

export class KeyValueStore {
  private readonly redisStore: QueueStore;
  constructor(redisStore: QueueStore) {
  this.redisStore  = redisStore;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.redisStore.setKey(key, value, ttlSeconds);
  }

  async get<T>(key: string): Promise<T | null> {
    return this.redisStore.getKey<T>(key);
  }

  async update<T>(key: string, value: T): Promise<boolean> {
    return this.redisStore.updateKey(key, value);
  }

  async delete(key: string): Promise<boolean> {
    return this.redisStore.deleteKey(key);
  }

  async isConnected(): Promise<boolean> {
    return this.redisStore.checkConnection();
  }

  async disconnect(): Promise<void> {
    await this.redisStore.disconnect();
  }
}
