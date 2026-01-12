import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response, NextFunction } from "express";
import { QueueStore } from "@store/queue_store";
import { getClientIP } from "@resource/customer/auditlogs/auditlogs.utility";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface RateLimitConfig {
  ipWindowMs: number;
  ipMaxAttempts: number;
  ipLockoutMs: number;
  identifierWindowMs: number;
  identifierMaxAttempts: number;
  identifierLockoutMs: number;
  cooldownMs: number;
  captchaThreshold: number;
  captchaWindowMs: number;
  progressiveLockoutMs: number[];
}

interface RateLimitData {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  lockoutUntil?: number;
  violations: number;
  captchaRequired: boolean;
}

interface CaptchaTrackingData {
  attempts: number;
  firstAttempt: number;
}

interface CooldownData {
  until: number;
}

interface RateLimitCheckResult {
  allowed: boolean;
  lockoutUntil?: number;
  remainingLockoutMinutes?: number;
  message?: string;
  data?: RateLimitData | null;
  key?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_OTP_SEND_CONFIG: RateLimitConfig = {
  ipWindowMs: 1 * 60 * 1000,
  ipMaxAttempts: 5,
  ipLockoutMs: 30 * 60 * 1000,
  identifierWindowMs: 60 * 60 * 1000,
  identifierMaxAttempts: 3,
  identifierLockoutMs: 2 * 60 * 60 * 1000,
  cooldownMs: 60 * 1000,
  captchaThreshold: 2,
  captchaWindowMs: 10 * 60 * 1000,
  progressiveLockoutMs: [
    5 * 60 * 1000,
    15 * 60 * 1000,
    30 * 60 * 1000,
    60 * 60 * 1000,
  ],
};

const DEFAULT_OTP_VERIFY_CONFIG: RateLimitConfig = {
  ipWindowMs: 15 * 60 * 1000,
  ipMaxAttempts: 10,
  ipLockoutMs: 15 * 60 * 1000,
  identifierWindowMs: 30 * 60 * 1000,
  identifierMaxAttempts: 5,
  identifierLockoutMs: 30 * 60 * 1000,
  cooldownMs: 5 * 1000,
  captchaThreshold: 3,
  captchaWindowMs: 10 * 60 * 1000,
  progressiveLockoutMs: [2 * 60 * 1000, 5 * 60 * 1000, 15 * 60 * 1000],
};

// ============================================================================
// Utility Functions
// ============================================================================

function extractIdentifier(req: Request): string | null {
  const body = req.body || {};
  return body.email || body.mobile || body.identity || body.value || null;
}

function isCaptchaValid(req: Request): boolean {
  const captchaToken = req.body?.captchaToken;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((req as any).rateLimitInfo?.requiresCaptcha && !captchaToken) {
    return false;
  }
  if (captchaToken) {
    return typeof captchaToken === "string" && captchaToken.length > 0;
  }
  return true;
}

function getLockoutDuration(
  violations: number,
  config: RateLimitConfig
): number {
  if (violations <= 0 || config.progressiveLockoutMs.length === 0) {
    return config.ipLockoutMs;
  }
  const index = Math.min(
    violations - 1,
    config.progressiveLockoutMs.length - 1
  );
  return config.progressiveLockoutMs[index] ?? config.ipLockoutMs;
}

// ============================================================================
// Redis Key Generators
// ============================================================================

function getKey(
  type: "IP" | "IDENTIFIER" | "COOLDOWN" | "CAPTCHA",
  endpoint: string,
  value: string
): string {
  return `RATE_LIMIT:${type}:${endpoint}:${value}`;
}

// ============================================================================
// Rate Limit Checking
// ============================================================================

async function checkRateLimit(
  store: QueueStore,
  key: string,
  windowMs: number,
  maxAttempts: number,
  config: RateLimitConfig,
  now: number
): Promise<RateLimitCheckResult> {
  const data = await store.getKey<RateLimitData>(key);
  const windowStart = now - windowMs;

  // No data or window expired
  if (!data || data.firstAttempt < windowStart) {
    return { allowed: true, data: null, key };
  }

  // Check lockout
  if (data.lockoutUntil && now < data.lockoutUntil) {
    const remainingLockout = Math.ceil((data.lockoutUntil - now) / 1000 / 60);
    return {
      allowed: false,
      lockoutUntil: data.lockoutUntil,
      remainingLockoutMinutes: remainingLockout,
      message: `Too many requests. Please try again after ${remainingLockout} minute(s).`,
      data,
      key,
    };
  }

  // Check if limit exceeded
  if (data.attempts >= maxAttempts) {
    const violations = (data.violations || 0) + 1;
    const lockoutDuration = getLockoutDuration(violations, config);
    const lockoutUntil = now + lockoutDuration;
    const remainingLockout = Math.ceil(lockoutDuration / 1000 / 60);

    return {
      allowed: false,
      lockoutUntil,
      remainingLockoutMinutes: remainingLockout,
      message: `Too many requests. Account locked for ${remainingLockout} minute(s).`,
      data,
      key,
    };
  }

  return { allowed: true, data, key };
}

async function checkCooldown(
  store: QueueStore,
  key: string
): Promise<{ allowed: boolean; remainingSeconds?: number }> {
  const data = await store.getKey<CooldownData>(key);
  if (!data) return { allowed: true };

  const now = Date.now();
  if (now < data.until) {
    return {
      allowed: false,
      remainingSeconds: Math.ceil((data.until - now) / 1000),
    };
  }
  return { allowed: true };
}

async function checkCaptchaRequirement(
  store: QueueStore,
  key: string,
  config: RateLimitConfig,
  now: number
): Promise<{ requiresCaptcha: boolean; data: CaptchaTrackingData | null }> {
  const data = await store.getKey<CaptchaTrackingData>(key);
  if (!data) return { requiresCaptcha: false, data: null };

  const windowStart = now - config.captchaWindowMs;
  const requiresCaptcha =
    data.firstAttempt >= windowStart &&
    data.attempts >= config.captchaThreshold;
  return { requiresCaptcha, data };
}

// ============================================================================
// Tracking Updates
// ============================================================================

function createRateLimitData(now: number): RateLimitData {
  return {
    attempts: 0,
    firstAttempt: now,
    lastAttempt: now,
    violations: 0,
    captchaRequired: false,
  };
}

async function updateRateLimitTracking(
  store: QueueStore,
  key: string,
  existingData: RateLimitData | null,
  windowMs: number,
  now: number
): Promise<void> {
  let data = existingData || createRateLimitData(now);
  const windowStart = now - windowMs;

  // Reset if window expired
  if (data.firstAttempt < windowStart) {
    data = createRateLimitData(now);
  }

  data.attempts += 1;
  data.lastAttempt = now;

  await store.setKey(key, data, Math.ceil(windowMs / 1000));
}

async function updateCooldownTracking(
  store: QueueStore,
  key: string,
  cooldownMs: number,
  now: number
): Promise<void> {
  await store.setKey(
    key,
    { until: now + cooldownMs },
    Math.ceil(cooldownMs / 1000)
  );
}

async function updateCaptchaTracking(
  store: QueueStore,
  key: string,
  existingData: CaptchaTrackingData | null,
  config: RateLimitConfig,
  now: number
): Promise<void> {
  let data = existingData || { attempts: 0, firstAttempt: now };
  const windowStart = now - config.captchaWindowMs;

  if (data.firstAttempt < windowStart) {
    data = { attempts: 0, firstAttempt: now };
  }

  data.attempts += 1;
  await store.setKey(key, data, Math.ceil(config.captchaWindowMs / 1000));
}

// ============================================================================
// Error Responses
// ============================================================================

function sendRateLimitError(
  res: Response,
  message: string,
  lockoutUntil?: number,
  retryAfter?: number
): void {
  const responseData: Record<string, unknown> = {
    code: "RATE_LIMIT_EXCEEDED",
    message,
    timestamp: new Date().toISOString(),
  };

  if (lockoutUntil) {
    responseData.lockoutUntil = new Date(lockoutUntil).toISOString();
  }
  if (retryAfter !== undefined) {
    responseData.retryAfter = retryAfter;
  }

  res.status(HttpStatus.TOO_MANY_REQUESTS).json({
    success: false,
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
    message,
    responseData,
  });
}

function sendCaptchaRequired(res: Response): void {
  res.status(HttpStatus.BAD_REQUEST).json({
    success: false,
    statusCode: HttpStatus.BAD_REQUEST,
    message:
      "Captcha verification is required. Please complete the captcha and try again.",
    responseData: {
      code: "CAPTCHA_REQUIRED",
      message:
        "Captcha verification is required. Please complete the captcha and try again.",
      requiresCaptcha: true,
      timestamp: new Date().toISOString(),
    },
  });
}

// ============================================================================
// Main Rate Limiter Middleware
// ============================================================================

export function createAuthRateLimiter(
  endpoint: string,
  config: RateLimitConfig = DEFAULT_OTP_SEND_CONFIG
) {
  const store = QueueStore.getStore();

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ip = getClientIP(req);
      const identifier = extractIdentifier(req);
      const now = Date.now();

      // Initialize rate limit info
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).rateLimitInfo = {
        requiresCaptcha: false,
        lockoutUntil: null,
        remainingAttempts: 0,
      };

      // Check IP rate limit
      const ipKey = getKey("IP", endpoint, ip);
      const ipCheck = await checkRateLimit(
        store,
        ipKey,
        config.ipWindowMs,
        config.ipMaxAttempts,
        config,
        now
      );

      if (!ipCheck.allowed) {
        if (ipCheck.lockoutUntil && ipCheck.data && ipCheck.key) {
          const violations = (ipCheck.data.violations || 0) + 1;
          await store.setKey(
            ipCheck.key,
            { ...ipCheck.data, lockoutUntil: ipCheck.lockoutUntil, violations },
            Math.ceil((ipCheck.lockoutUntil - now) / 1000)
          );
        }
        sendRateLimitError(
          res,
          ipCheck.message || "Too many requests from this IP.",
          ipCheck.lockoutUntil,
          ipCheck.remainingLockoutMinutes
            ? Math.ceil(ipCheck.remainingLockoutMinutes * 60)
            : undefined
        );
        return;
      }

      // Check identifier rate limit
      if (identifier) {
        const identifierKey = getKey("IDENTIFIER", endpoint, identifier);
        const identifierCheck = await checkRateLimit(
          store,
          identifierKey,
          config.identifierWindowMs,
          config.identifierMaxAttempts,
          config,
          now
        );

        if (!identifierCheck.allowed) {
          if (
            identifierCheck.lockoutUntil &&
            identifierCheck.data &&
            identifierCheck.key
          ) {
            const violations = (identifierCheck.data.violations || 0) + 1;
            await store.setKey(
              identifierCheck.key,
              {
                ...identifierCheck.data,
                lockoutUntil: identifierCheck.lockoutUntil,
                violations,
              },
              Math.ceil((identifierCheck.lockoutUntil - now) / 1000)
            );
          }
          const identifierType = identifier.includes("@")
            ? "email"
            : "phone number";
          sendRateLimitError(
            res,
            `Too many requests for this ${identifierType}. ${identifierCheck.message || ""}`,
            identifierCheck.lockoutUntil,
            identifierCheck.remainingLockoutMinutes
              ? Math.ceil(identifierCheck.remainingLockoutMinutes * 60)
              : undefined
          );
          return;
        }
      }

      // Check cooldown
      const cooldownKey = getKey(
        "COOLDOWN",
        endpoint,
        identifier || `IP:${ip}`
      );
      const cooldownCheck = await checkCooldown(store, cooldownKey);

      if (!cooldownCheck.allowed) {
        res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          success: false,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Please wait ${cooldownCheck.remainingSeconds} second(s) before making another request.`,
          responseData: {
            code: "COOLDOWN_ACTIVE",
            message: `Please wait ${cooldownCheck.remainingSeconds} second(s) before making another request.`,
            retryAfter: cooldownCheck.remainingSeconds,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // Check captcha requirement
      const captchaKey = getKey("CAPTCHA", endpoint, identifier || `IP:${ip}`);
      const captchaCheck = await checkCaptchaRequirement(
        store,
        captchaKey,
        config,
        now
      );

      if (captchaCheck.requiresCaptcha) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).rateLimitInfo.requiresCaptcha = true;
        if (!isCaptchaValid(req)) {
          sendCaptchaRequired(res);
          return;
        }
      }

      // All checks passed - update tracking
      await updateRateLimitTracking(
        store,
        ipKey,
        ipCheck.data || null,
        config.ipWindowMs,
        now
      );

      if (identifier) {
        const identifierKey = getKey("IDENTIFIER", endpoint, identifier);
        const identifierData = await store.getKey<RateLimitData>(identifierKey);
        await updateRateLimitTracking(
          store,
          identifierKey,
          identifierData,
          config.identifierWindowMs,
          now
        );
      }

      await updateCooldownTracking(store, cooldownKey, config.cooldownMs, now);
      await updateCaptchaTracking(
        store,
        captchaKey,
        captchaCheck.data,
        config,
        now
      );

      next();
    } catch (error) {
      console.error("Rate limiting error:", error);
      next(); // Fail open
    }
  };
}

// ============================================================================
// Success Tracking (for analytics/monitoring)
// ============================================================================

/**
 * Track successful request (optional - for analytics/monitoring)
 * Note: Attempts are already tracked in the middleware
 */
export async function trackRateLimitSuccess(
  req: Request,
  endpoint: string,
  _config: RateLimitConfig = DEFAULT_OTP_SEND_CONFIG
): Promise<void> {
  try {
    // Could add success-specific tracking here if needed
    void _config;
    void endpoint;
    void req;
  } catch (error) {
    console.error("Error tracking rate limit success:", error);
  }
}

// ============================================================================
// Pre-configured Rate Limiters
// ============================================================================

export const otpSendRateLimiter = createAuthRateLimiter(
  "otp-send",
  DEFAULT_OTP_SEND_CONFIG
);
export const otpVerifyRateLimiter = createAuthRateLimiter(
  "otp-verify",
  DEFAULT_OTP_VERIFY_CONFIG
);
export const emailVerifyRateLimiter = createAuthRateLimiter(
  "email-verify",
  DEFAULT_OTP_SEND_CONFIG
);
export const loginRateLimiter = createAuthRateLimiter(
  "signup",
  DEFAULT_OTP_SEND_CONFIG
);
