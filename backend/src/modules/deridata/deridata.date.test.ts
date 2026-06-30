import { describe, it, expect } from "bun:test";
import { deridataDateToIstIso, deridataDateToIstDateOnly } from "./deridata.date";

describe("deridataDateToIstIso", () => {
  it("parses DD-MMM-YYYY to an IST-aligned ISO instant", () => {
    // 11-Apr-2028 at IST midnight === 2028-04-11T05:30:00 in ISO (UTC+5:30 offset baked in)
    expect(deridataDateToIstIso("11-Apr-2028")).toBe("2028-04-11T05:30:00.000Z");
  });
  it("is case-insensitive on the month", () => {
    expect(deridataDateToIstIso("26-jun-2023")).toBe("2023-06-26T05:30:00.000Z");
  });
  it("returns null for null conventions", () => {
    for (const v of [null, undefined, "", "-", "N/A", "NA", "garbage", "2026-04-16"]) {
      expect(deridataDateToIstIso(v as any)).toBeNull();
    }
  });
});

describe("deridataDateToIstDateOnly", () => {
  it("returns a Date for valid input and undefined otherwise", () => {
    expect(deridataDateToIstDateOnly("11-Apr-2028")).toBeInstanceOf(Date);
    expect(deridataDateToIstDateOnly("-")).toBeUndefined();
  });
});
