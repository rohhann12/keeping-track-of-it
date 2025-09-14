import { Request, Response, NextFunction } from 'express';
import getRedisClient from '../lib/redis';

export const cacheMiddleware = (key: string, ttl: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redisClient = await getRedisClient();

      // If Redis is not available, skip caching
      if (!redisClient) {
        console.log("init redis")
        return next();
      }

      const cacheKey = `${key}`;
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log('Cache hit for key:', cacheKey);
        console.log(cachedData)
        return res.json(JSON.parse(cachedData));
      }
      // Store original res.json
      const originalJson = res.json.bind(res);

      res.json = function (data: any) {
        // Cache the response only if Redis is available
        if (redisClient) {
          redisClient.setEx(cacheKey, ttl, JSON.stringify(data))
            .catch(err => console.error('Redis set error:', err));
        }

        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export const invalidateCache = async (id: string) => {
  try {
    const redisClient = await getRedisClient();
    console.log("here")
    // If Redis is not available, skip cache invalidation
    if (!redisClient) {
      console.log('Redis not available, skipping cache invalidation');
      return;
    }

    const keys = await redisClient.keys(id);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Invalidated ${keys.length} cache keys matching id: ${id}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};
