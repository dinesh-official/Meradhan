import { describe, it, expect } from "bun:test";
import { z } from "zod";

// Re-declare the Deridata sub-schema shape to assert defaults/coercion behave.
// (env.ts parses process.env at import time; here we test the schema rules in isolation.)
// NOTE: env vars are strings, so booleans must NOT use z.coerce.boolean() —
// Boolean("false") === true. Treat only "true"/"1" as true.
const boolFromEnv = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((v) => v === true || v === "true" || v === "1");

const DeridataSchema = z.object({
  DERIDATA_MERCHANT_ID: z.coerce.number().int().positive().optional(),
  DERIDATA_SECRET_KEY: z.string().min(1).optional(),
  DERIDATA_MERCHANT_NAME: z.string().min(1).optional(),
  DERIDATA_MERCHANT_EMAIL: z.email().optional(),
  DERIDATA_PUBLIC_IP: z.string().min(1).optional(),
  DERIDATA_BASE_URL: z.url().optional().default("https://www.deridata.com"),
  DERIDATA_DAILY_CALL_LIMIT: z.coerce.number().int().positive().default(10000),
  DERIDATA_ENABLED: boolFromEnv,
  USE_DERIDATA_CALCULATOR: boolFromEnv,
  USE_DERIDATA_AS_CATALOG: boolFromEnv,
});

describe("Deridata env schema", () => {
  it("applies defaults when unset", () => {
    const parsed = DeridataSchema.parse({});
    expect(parsed.DERIDATA_BASE_URL).toBe("https://www.deridata.com");
    expect(parsed.DERIDATA_DAILY_CALL_LIMIT).toBe(10000);
    expect(parsed.DERIDATA_ENABLED).toBe(false);
    expect(parsed.DERIDATA_MERCHANT_ID).toBeUndefined();
  });

  it("coerces numeric and boolean strings from process.env", () => {
    const parsed = DeridataSchema.parse({
      DERIDATA_MERCHANT_ID: "101",
      DERIDATA_DAILY_CALL_LIMIT: "5000",
      DERIDATA_ENABLED: "true",
    });
    expect(parsed.DERIDATA_MERCHANT_ID).toBe(101);
    expect(parsed.DERIDATA_DAILY_CALL_LIMIT).toBe(5000);
    expect(parsed.DERIDATA_ENABLED).toBe(true);
  });

  it("treats the string \"false\" as false (regression: not z.coerce.boolean)", () => {
    const parsed = DeridataSchema.parse({
      DERIDATA_ENABLED: "false",
      USE_DERIDATA_CALCULATOR: "0",
    });
    expect(parsed.DERIDATA_ENABLED).toBe(false);
    expect(parsed.USE_DERIDATA_CALCULATOR).toBe(false);
  });
});
