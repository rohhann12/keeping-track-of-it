import { Request, Response, NextFunction } from 'express';
import redisClient from '../lib/redis';

export const cacheMiddleware = (key: string, ttl: number = 60) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await redisClient.connect();
      
      const cacheKey = `${key}:${'anonymous'}`;
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log('Cache hit for key:', cacheKey);
        return res.json(JSON.parse(cachedData));
      }

      // Store original res.json
      const originalJson = res.json.bind(res);
      
      res.json = function(data: any) {
        // Cache the response
        redisClient.setEx(cacheKey, ttl, JSON.stringify(data))
          .catch(err => console.error('Redis set error:', err));
        
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export const invalidateCache = async (pattern: string) => {
  try {
    await redisClient.connect();
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};
