import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isInitialized = false;
let isConnected = false;

const getRedisClient = async (): Promise<RedisClientType | null> => {
  // If not initialized, create client but don't connect yet
  if (!isInitialized) {
    try {
      redisClient = createClient({
        url: 'redis://127.0.0.1:6379'
      });

      redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
        isConnected = false;
      });

      redisClient.on('connect', () => {
        console.log('Connected to Redis');
        isConnected = true;
      });

      redisClient.on('disconnect', () => {
        console.log('Disconnected from Redis');
        isConnected = false;
      });

      isInitialized = true;
    } catch (error) {
      console.error('Failed to create Redis client:', error);
      return null;
    }
  }

  // If client exists but not connected, try to connect
  if (redisClient && !isConnected) {
    try {
      await redisClient.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      return null;
    }
  }

  return redisClient;
};

export default getRedisClient;
