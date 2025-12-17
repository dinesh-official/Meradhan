import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response, NextFunction } from "express";
import { QueueStore } from "@store/queue_store";
import { getClientIP } from "@resource/customer/auditlogs/auditlogs.utility";

/**
 * Rate limiting configuration for customer auth endpoints
 */
interface RateLimitConfig {
  // Per-IP limits
  ipWindowMs: number; // Time window for IP-based rate limiting
  ipMaxAttempts: number; // Max attempts per IP in window
  ipLockoutMs: number; // Lockout duration after exceeding IP limit

  // Per-identifier limits (email/phone)
  identifierWindowMs: number; // Time window for identifier-based rate limiting
  identifierMaxAttempts: number; // Max attempts per identifier in window
  identifierLockoutMs: number; // Lockout duration after exceeding identifier limit

  // Cool-down period after each attempt
  cooldownMs: number; // Minimum time between attempts

  // Captcha escalation
  captchaThreshold: number; // Require captcha after N attempts
  captchaWindowMs: number; // Window for counting attempts for captcha requirement

  // Progressive lockout
  progressiveLockoutMs: number[]; // Increasing lockout durations for repeated violations
}

/**
 * Default configuration for OTP send endpoints (signup, signin, forget password)
 */
const DEFAULT_OTP_SEND_CONFIG: RateLimitConfig = {
  ipWindowMs: 15 * 60 * 1000, // 15 minutes
  ipMaxAttempts: 5, // 5 attempts per IP per 15 minutes
  ipLockoutMs: 30 * 60 * 1000, // 30 minute lockout

  identifierWindowMs: 60 * 60 * 1000, // 1 hour
  identifierMaxAttempts: 3, // 3 attempts per identifier per hour
  identifierLockoutMs: 2 * 60 * 60 * 1000, // 2 hour lockout

  cooldownMs: 60 * 1000, // 1 minute cooldown between attempts

  captchaThreshold: 2, // Require captcha after 2 attempts
  captchaWindowMs: 10 * 60 * 1000, // 10 minutes

  progressiveLockoutMs: [
    5 * 60 * 1000, // 5 minutes for first violation
    15 * 60 * 1000, // 15 minutes for second violation
    30 * 60 * 1000, // 30 minutes for third violation
    60 * 60 * 1000, // 1 hour for fourth violation
  ],
};

/**
 * Default configuration for OTP verify endpoints
 */
const DEFAULT_OTP_VERIFY_CONFIG: RateLimitConfig = {
  ipWindowMs: 15 * 60 * 1000,
  ipMaxAttempts: 10, // More lenient for verification
  ipLockoutMs: 15 * 60 * 1000,

  identifierWindowMs: 30 * 60 * 1000,
  identifierMaxAttempts: 5,
  identifierLockoutMs: 30 * 60 * 1000,

  cooldownMs: 5 * 1000, // 5 seconds cooldown

  captchaThreshold: 3,
  captchaWindowMs: 10 * 60 * 1000,

  progressiveLockoutMs: [
    2 * 60 * 1000, // 2 minutes
    5 * 60 * 1000, // 5 minutes
    15 * 60 * 1000, // 15 minutes
  ],
};

/**
 * Rate limit tracking data structure
 */
interface RateLimitData {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  lockoutUntil?: number;
  violations: number; // Track repeated violations for progressive lockout
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
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract identifier (email or phone) from request body
 */
function extractIdentifier(req: Request): string | null {
  const body = req.body || {};
  return body.email || body.mobile || body.identity || body.value || null;
}

/**
 * Check if captcha token is provided and valid
 * For now, we'll check if captchaToken exists in body
 * You can enhance this with actual captcha verification
 */
function isCaptchaValid(req: Request): boolean {
  const captchaToken = req.body?.captchaToken;
  // If captcha is required but not provided, return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((req as any).rateLimitInfo?.requiresCaptcha && !captchaToken) {
    return false;
  }
  // If captcha is provided, validate it (implement your captcha validation logic)
  if (captchaToken) {
    // TODO: Implement actual captcha verification
    // For now, we'll accept any non-empty string as valid
    return typeof captchaToken === "string" && captchaToken.length > 0;
  }
  return true; // Captcha not required
}

/**
 * Get identifier type for error messages
 */
function getIdentifierType(identifier: string): string {
  return identifier.includes("@") ? "email" : "phone number";
}

// ============================================================================
// Redis Key Generators
// ============================================================================

function getIPKey(ip: string, endpoint: string): string {
  return `RATE_LIMIT:IP:${endpoint}:${ip}`;
}

function getIdentifierKey(identifier: string, endpoint: string): string {
  return `RATE_LIMIT:IDENTIFIER:${endpoint}:${identifier}`;
}

function getCooldownKey(
  ip: string,
  identifier: string | null,
  endpoint: string
): string {
  if (identifier) {
    return `RATE_LIMIT:COOLDOWN:${endpoint}:${identifier}`;
  }
  return `RATE_LIMIT:COOLDOWN:${endpoint}:IP:${ip}`;
}

function getCaptchaKey(
  ip: string,
  identifier: string | null,
  endpoint: string
): string {
  if (identifier) {
    return `RATE_LIMIT:CAPTCHA:${endpoint}:${identifier}`;
  }
  return `RATE_LIMIT:CAPTCHA:${endpoint}:IP:${ip}`;
}

// ============================================================================
// Lockout Duration Calculation
// ============================================================================

function getLockoutDuration(
  violations: number,
  config: RateLimitConfig
): number {
  if (violations <= 0) return 0;
  if (config.progressiveLockoutMs.length === 0) {
    return config.ipLockoutMs;
  }
  const index = Math.min(
    violations - 1,
    config.progressiveLockoutMs.length - 1
  );
  const duration =
    config.progressiveLockoutMs[index] ??
    config.progressiveLockoutMs[config.progressiveLockoutMs.length - 1];
  return duration ?? config.ipLockoutMs;
}

// ============================================================================
// Error Response Helpers
// ============================================================================

function createRateLimitErrorResponse(
  message: string,
  code: string,
  lockoutUntil?: number,
  retryAfter?: number
) {
  const responseData: Record<string, unknown> = {
    code,
    message,
    timestamp: new Date().toISOString(),
  };

  if (lockoutUntil) {
    responseData.lockoutUntil = new Date(lockoutUntil).toISOString();
  }

  if (retryAfter !== undefined) {
    responseData.retryAfter = retryAfter;
  }

  return {
    success: false,
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
    message,
    responseData,
  };
}

function createCaptchaRequiredResponse() {
  return {
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
  };
}

function sendRateLimitError(
  res: Response,
  message: string,
  code: string,
  lockoutUntil?: number,
  retryAfter?: number
): void {
  res
    .status(HttpStatus.TOO_MANY_REQUESTS)
    .json(
      createRateLimitErrorResponse(message, code, lockoutUntil, retryAfter)
    );
}

// ============================================================================
// Rate Limit Checking Logic
// ============================================================================

interface RateLimitCheckParams {
  data: RateLimitData | null;
  windowMs: number;
  maxAttempts: number;
  lockoutMs: number;
  config: RateLimitConfig;
  now: number;
}

async function checkRateLimit(
  params: RateLimitCheckParams
): Promise<RateLimitCheckResult> {
  const { data, windowMs, maxAttempts, config, now } = params;

  if (!data) {
    return { allowed: true };
  }

  const windowStart = now - windowMs;

  // Check if currently locked out
  if (data.lockoutUntil && now < data.lockoutUntil) {
    const remainingLockout = Math.ceil((data.lockoutUntil - now) / 1000 / 60);
    return {
      allowed: false,
      lockoutUntil: data.lockoutUntil,
      remainingLockoutMinutes: remainingLockout,
      message: `Too many requests. Please try again after ${remainingLockout} minute(s).`,
    };
  }

  // Reset window if expired
  if (data.firstAttempt < windowStart) {
    return { allowed: true };
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
    };
  }

  return { allowed: true };
}

async function checkIPRateLimit(
  store: QueueStore,
  ip: string,
  endpoint: string,
  config: RateLimitConfig,
  now: number
): Promise<RateLimitCheckResult & { data: RateLimitData | null; key: string }> {
  const key = getIPKey(ip, endpoint);
  const data = await store.getKey<RateLimitData>(key);

  const result = await checkRateLimit({
    data,
    windowMs: config.ipWindowMs,
    maxAttempts: config.ipMaxAttempts,
    lockoutMs: config.ipLockoutMs,
    config,
    now,
  });

  return { ...result, data, key };
}

async function checkIdentifierRateLimit(
  store: QueueStore,
  identifier: string,
  endpoint: string,
  config: RateLimitConfig,
  now: number
): Promise<RateLimitCheckResult & { data: RateLimitData | null; key: string }> {
  const key = getIdentifierKey(identifier, endpoint);
  const data = await store.getKey<RateLimitData>(key);

  const result = await checkRateLimit({
    data,
    windowMs: config.identifierWindowMs,
    maxAttempts: config.identifierMaxAttempts,
    lockoutMs: config.identifierLockoutMs,
    config,
    now,
  });

  return { ...result, data, key };
}

async function checkCooldown(
  store: QueueStore,
  ip: string,
  identifier: string | null,
  endpoint: string
): Promise<{ allowed: boolean; remainingSeconds?: number }> {
  const key = getCooldownKey(ip, identifier, endpoint);
  const data = await store.getKey<CooldownData>(key);

  if (!data) {
    return { allowed: true };
  }

  const now = Date.now();
  if (now < data.until) {
    const remainingSeconds = Math.ceil((data.until - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  return { allowed: true };
}

async function checkCaptchaRequirement(
  store: QueueStore,
  ip: string,
  identifier: string | null,
  endpoint: string,
  config: RateLimitConfig,
  now: number
): Promise<{ requiresCaptcha: boolean; data: CaptchaTrackingData | null }> {
  const key = getCaptchaKey(ip, identifier, endpoint);
  const data = await store.getKey<CaptchaTrackingData>(key);

  if (!data) {
    return { requiresCaptcha: false, data: null };
  }

  const windowStart = now - config.captchaWindowMs;
  if (
    data.firstAttempt >= windowStart &&
    data.attempts >= config.captchaThreshold
  ) {
    return { requiresCaptcha: true, data };
  }

  return { requiresCaptcha: false, data };
}

// ============================================================================
// Tracking Update Logic
// ============================================================================

function createInitialRateLimitData(now: number): RateLimitData {
  return {
    attempts: 0,
    firstAttempt: now,
    lastAttempt: now,
    violations: 0,
    captchaRequired: false,
  };
}

function resetWindowIfExpired(
  data: RateLimitData,
  windowMs: number,
  now: number
): RateLimitData {
  const windowStart = now - windowMs;
  if (data.firstAttempt < windowStart) {
    return {
      ...data,
      attempts: 0,
      firstAttempt: now,
      lastAttempt: now,
      violations: 0,
      captchaRequired: false,
    };
  }
  return data;
}

async function updateIPTracking(
  store: QueueStore,
  key: string,
  existingData: RateLimitData | null,
  config: RateLimitConfig,
  now: number
): Promise<void> {
  let data = existingData || createInitialRateLimitData(now);
  data = resetWindowIfExpired(data, config.ipWindowMs, now);

  data.attempts += 1;
  data.lastAttempt = now;

  await store.setKey(key, data, Math.ceil(config.ipWindowMs / 1000));
}

async function updateIdentifierTracking(
  store: QueueStore,
  key: string,
  existingData: RateLimitData | null,
  config: RateLimitConfig,
  now: number
): Promise<void> {
  let data = existingData || createInitialRateLimitData(now);
  data = resetWindowIfExpired(data, config.identifierWindowMs, now);

  data.attempts += 1;
  data.lastAttempt = now;

  await store.setKey(key, data, Math.ceil(config.identifierWindowMs / 1000));
}

async function updateCooldown(
  store: QueueStore,
  key: string,
  config: RateLimitConfig,
  now: number
): Promise<void> {
  await store.setKey(
    key,
    { until: now + config.cooldownMs },
    Math.ceil(config.cooldownMs / 1000)
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
// Main Rate Limiter Middleware
// ============================================================================

/**
 * Create rate limiting middleware
 */
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

      // Initialize rate limit info on request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).rateLimitInfo = {
        requiresCaptcha: false,
        lockoutUntil: null,
        remainingAttempts: 0,
      };

      // Check IP-based rate limiting
      const ipCheck = await checkIPRateLimit(store, ip, endpoint, config, now);
      if (!ipCheck.allowed) {
        // Apply lockout if limit exceeded
        if (ipCheck.lockoutUntil && ipCheck.data) {
          const violations = (ipCheck.data.violations || 0) + 1;
          await store.setKey(
            ipCheck.key,
            {
              ...ipCheck.data,
              lockoutUntil: ipCheck.lockoutUntil,
              violations,
            },
            Math.ceil((ipCheck.lockoutUntil - now) / 1000)
          );
        }
        sendRateLimitError(
          res,
          ipCheck.message || "Too many requests from this IP.",
          "RATE_LIMIT_EXCEEDED",
          ipCheck.lockoutUntil,
          ipCheck.remainingLockoutMinutes
            ? Math.ceil(ipCheck.remainingLockoutMinutes * 60)
            : undefined
        );
        return;
      }

      // Check identifier-based rate limiting
      if (identifier) {
        const identifierCheck = await checkIdentifierRateLimit(
          store,
          identifier,
          endpoint,
          config,
          now
        );
        if (!identifierCheck.allowed) {
          // Apply lockout if limit exceeded
          if (identifierCheck.lockoutUntil && identifierCheck.data) {
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
          const identifierType = getIdentifierType(identifier);
          sendRateLimitError(
            res,
            `Too many requests for this ${identifierType}. ${identifierCheck.message || ""}`,
            "RATE_LIMIT_EXCEEDED",
            identifierCheck.lockoutUntil,
            identifierCheck.remainingLockoutMinutes
              ? Math.ceil(identifierCheck.remainingLockoutMinutes * 60)
              : undefined
          );
          return;
        }
      }

      // Check cooldown period
      const cooldownCheck = await checkCooldown(
        store,
        ip,
        identifier,
        endpoint
      );
      if (!cooldownCheck.allowed) {
        res
          .status(HttpStatus.TOO_MANY_REQUESTS)
          .json(
            createRateLimitErrorResponse(
              `Please wait ${cooldownCheck.remainingSeconds} second(s) before making another request.`,
              "COOLDOWN_ACTIVE",
              undefined,
              cooldownCheck.remainingSeconds
            )
          );
        return;
      }

      // Check captcha requirement
      const captchaCheck = await checkCaptchaRequirement(
        store,
        ip,
        identifier,
        endpoint,
        config,
        now
      );
      if (captchaCheck.requiresCaptcha) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).rateLimitInfo.requiresCaptcha = true;

        if (!isCaptchaValid(req)) {
          res
            .status(HttpStatus.BAD_REQUEST)
            .json(createCaptchaRequiredResponse());
          return;
        }
      }

      // All checks passed - update tracking
      const ipKey = getIPKey(ip, endpoint);
      await updateIPTracking(store, ipKey, ipCheck.data, config, now);

      if (identifier) {
        const identifierKey = getIdentifierKey(identifier, endpoint);
        const identifierCheckResult = await checkIdentifierRateLimit(
          store,
          identifier,
          endpoint,
          config,
          now
        );
        await updateIdentifierTracking(
          store,
          identifierKey,
          identifierCheckResult.data,
          config,
          now
        );
      }

      const cooldownKey = getCooldownKey(ip, identifier, endpoint);
      await updateCooldown(store, cooldownKey, config, now);

      const captchaKey = getCaptchaKey(ip, identifier, endpoint);
      await updateCaptchaTracking(
        store,
        captchaKey,
        captchaCheck.data,
        config,
        now
      );

      // Proceed to next middleware
      next();
    } catch (error) {
      // On error, allow the request to proceed (fail open)
      // Log the error for monitoring
      console.error("Rate limiting error:", error);
      next();
    }
  };
}

// ============================================================================
// Success Tracking (for analytics/monitoring)
// ============================================================================

/**
 * Middleware to track successful request (optional - for analytics/monitoring)
 * Note: Attempts are already tracked in the middleware, this is for additional tracking if needed
 */
export async function trackRateLimitSuccess(
  req: Request,
  endpoint: string,
  _config: RateLimitConfig = DEFAULT_OTP_SEND_CONFIG
): Promise<void> {
  // Attempts are already tracked in the middleware
  // This function can be used for additional analytics or monitoring if needed
  // For now, we'll keep it as a no-op to maintain API compatibility
  try {
    // Could add success-specific tracking here if needed
    // e.g., separate counters for successful vs failed attempts
    void _config;
    void endpoint;
    void req;
  } catch (error) {
    console.error("Error tracking rate limit success:", error);
    // Don't throw - rate limiting should not break the flow
  }
}

// ============================================================================
// Pre-configured Rate Limiters
// ============================================================================

/**
 * Pre-configured rate limiters for common endpoints
 */
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
