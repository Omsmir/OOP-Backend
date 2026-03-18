import { logger } from '@/utils/logger';
import rateLimit, { Options } from 'express-rate-limit';

class RateLimiters {
    static create(options?: Partial<Options>) {
        return rateLimit({
            windowMs: 15 * 60 * 1000,
            limit: 5,
            standardHeaders: true,
            legacyHeaders: false,
            message: 'Too many requests, please try again later',

            handler: (req, res) => {
                logger.error(`[RateLimit] ${req.ip} exceeded ${options?.limit ?? 5} requests`);

                res.status(429).json({
                    message: options?.message ?? 'Rate limit exceeded',
                });
            },

            ...options, // OVERRIDE DEFAULTS
        });
    }
}

export default RateLimiters;
