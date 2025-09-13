import { Request, Response, NextFunction } from 'express';
export declare const cacheMiddleware: (key: string, ttl?: number) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const invalidateCache: (pattern: string) => Promise<void>;
//# sourceMappingURL=cache.d.ts.map