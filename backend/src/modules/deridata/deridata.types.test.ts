import { describe, it, expect } from "bun:test";
import {
  assertDeridataIsin,
  IssueDetailSchema,
  parseEndpointResponse,
  classifyError,
} from "./deridata.types";

describe("assertDeridataIsin", () => {
  it("normalizes valid ISIN", () => {
    expect(assertDeridataIsin(" ine2otq07077 ")).toBe("INE2OTQ07077");
  });
  it("throws on empty", () => {
    expect(() => assertDeridataIsin("")).toThrow();
  });
});

describe("parseEndpointResponse", () => {
  it("returns ok:true with parsed data for a valid issue-detail body", () => {
    const body = { isin: "INE2OTQ07077", coupon: "6.2626%", coupon_type: "Fixed", tags: [] };
    const res = parseEndpointResponse(IssueDetailSchema, body);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.isin).toBe("INE2OTQ07077");
  });

  it("returns ok:false NOT_FOUND for an error body", () => {
    const res = parseEndpointResponse(IssueDetailSchema, { error: "No record found for ISIN" }, 404);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("NOT_FOUND");
  });
});

describe("classifyError", () => {
  it("maps statuses to codes", () => {
    expect(classifyError(401, { error: "Invalid checksum" })).toBe("INVALID_CHECKSUM");
    expect(classifyError(401, { error: "Invalid merchant_id" })).toBe("INVALID_MERCHANT");
    expect(classifyError(403, { error: "Limit expired" })).toBe("LIMIT_EXPIRED");
    expect(classifyError(404, { error: "No record found for ISIN" })).toBe("NOT_FOUND");
    expect(classifyError(400, { error: "Invalid JSON body" })).toBe("BAD_REQUEST");
    expect(classifyError(500, { error: "An error occurred" })).toBe("SERVER_ERROR");
  });
});
