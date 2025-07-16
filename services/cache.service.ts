import { cache } from "sharp";
import { redisClient } from "../middlewares/Session";

const defaultTTL = 3600; // 1 hour cache items

export class cacheService {
  static genereteKey(...array: string[]) {
    return array.join(":");
  }
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.log("cache get Error:", err);
      return null;
    }
  }
  static async set(
    key: string,
    value: any,
    ttl: number = defaultTTL
  ): Promise<Boolean> {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (err) {
      console.log("cache get Error:", err);
      return false;
    }
  }
  static async del(key: string): Promise<Boolean> {
    try {
      await redisClient.del(key);
      return true;
    } catch (err) {
      console.log("cache get Error:", err);
      return false;
    }
  }

  static async delPattern(pattern: string): Promise<Boolean> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (err) {
      console.log("cache get Error:", err);
      return false;
    }
  }
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = defaultTTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached != null) {
      return cached;
    }
    const data = await fetcher();

    await this.set(key, data, ttl);

    return data;
  }
}
