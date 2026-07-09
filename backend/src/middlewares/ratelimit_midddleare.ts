import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { RequestHandler, Request } from "express";

interface RateLimitOptions {
  max: number;
  min?: number;
  message?: string;
}

export const withRateLimit = ({
  max,
  min = 1,
  message = "Your IP is temporarily blocked. Please try again later.",
}: RateLimitOptions): RequestHandler => {
  return rateLimit({
    windowMs: min * 60 * 1000,
    limit: max,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    keyGenerator: (req: Request) => {
      const method = req.method;
      const path = req.baseUrl + req.path;

      // ✅ IP handled ONLY by ipKeyGenerator
      const ipKey = ipKeyGenerator(req.ip ?? "unknown");

      // ✅ Safe to append endpoint data AFTER
      return `${ipKey}:${method}:${path}`;
    },

    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message,
        status: 429,
      });
    },
  });
};
