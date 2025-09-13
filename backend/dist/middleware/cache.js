"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCache = exports.cacheMiddleware = void 0;
const redis_1 = __importDefault(require("../lib/redis"));
const cacheMiddleware = (key, ttl = 60) => {
    return async (req, res, next) => {
        try {
            await redis_1.default.connect();
            const cacheKey = `${key}:${'anonymous'}`;
            const cachedData = await redis_1.default.get(cacheKey);
            if (cachedData) {
                console.log('Cache hit for key:', cacheKey);
                return res.json(JSON.parse(cachedData));
            }
            // Store original res.json
            const originalJson = res.json.bind(res);
            res.json = function (data) {
                // Cache the response
                redis_1.default.setEx(cacheKey, ttl, JSON.stringify(data))
                    .catch(err => console.error('Redis set error:', err));
                return originalJson(data);
            };
            next();
        }
        catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
const invalidateCache = async (pattern) => {
    try {
        await redis_1.default.connect();
        const keys = await redis_1.default.keys(pattern);
        if (keys.length > 0) {
            await redis_1.default.del(keys);
            console.log(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
        }
    }
    catch (error) {
        console.error('Cache invalidation error:', error);
    }
};
exports.invalidateCache = invalidateCache;
//# sourceMappingURL=cache.js.map