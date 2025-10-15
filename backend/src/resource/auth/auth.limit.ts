import { HttpStatus } from '@utils/error/AppError';
import type { Request, Response } from 'express';
import { rateLimit, type RateLimitRequestHandler } from 'express-rate-limit';

export const loginWithOtpLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    handler: (req: Request, res: Response) => {
        res.sendResponse({
            success: false,
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'You have exceeded the request limit. Please try again after some times.',
            responseData: {
                code: 'TOO_MANY_REQUESTS',
                message: 'You have exceeded the request limit. Please try again later.',
                timestamp: new Date().toISOString(),
            },
        });
    },
});
