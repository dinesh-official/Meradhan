import { describe, expect, it } from "bun:test";
import { appSchema } from "@root/schema";

describe("createServiceRequestSchema", () => {
  const schema = appSchema.customer.createServiceRequestSchema;

  it("accepts valid closure request payload", () => {
    const result = schema.safeParse({
      type: "CLOSURE",
      reasonId: 1,
      reasonRemark: "Moving to another platform",
    });
    expect(result.success).toBe(true);
  });

  it("rejects remark longer than 500 characters", () => {
    const result = schema.safeParse({
      type: "CLOSURE",
      reasonId: 1,
      reasonRemark: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("requires positive reasonId", () => {
    const result = schema.safeParse({
      type: "CLOSURE",
      reasonId: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateCustomerProfileSchema", () => {
  const schema = appSchema.customer.updateCustomerProfileSchema;

  it("rejects CLOSED status via generic customer update", () => {
    const result = schema.safeParse({ status: "CLOSED" });
    expect(result.success).toBe(false);
  });

  it("allows ACTIVE and SUSPENDED status updates", () => {
    expect(schema.safeParse({ status: "ACTIVE" }).success).toBe(true);
    expect(schema.safeParse({ status: "SUSPENDED" }).success).toBe(true);
  });
});
