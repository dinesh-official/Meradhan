import { describe, it, expect } from "bun:test";
import {
  buildChecksumMessage,
  signChecksum,
  generateUuid,
  buildAuthFields,
} from "./deridata.checksum";

describe("deridata checksum", () => {
  it("builds the message with | and no spaces", () => {
    const msg = buildChecksumMessage({
      uuid: "abc-123",
      merchantId: 101,
      merchantName: "TestMerchant",
      merchantEmail: "test@mail.com",
      publicIp: "192.168.1.1",
    });
    expect(msg).toBe("abc-123|101|TestMerchant|test@mail.com|192.168.1.1");
  });

  it("matches the documented HMAC-SHA256 golden vector", () => {
    const msg = "abc-123|101|TestMerchant|test@mail.com|192.168.1.1";
    expect(signChecksum(msg, "your_secret_key")).toBe(
      "9c7hzRj0Dt5KzpnXUY4y0DZhontMeL8QoO+QV/B6hxk=",
    );
  });

  it("generates a fresh, well-formed uuid each call", () => {
    const a = generateUuid(101);
    const b = generateUuid(101);
    expect(a).not.toBe(b);
    expect(a.split("|")[0]).toBe("101");
    expect(a.split("|")).toHaveLength(3);
  });

  it("buildAuthFields returns merchant_id, uuid, and a verifiable checksum", () => {
    const fields = buildAuthFields({
      merchantId: 101,
      merchantName: "TestMerchant",
      merchantEmail: "test@mail.com",
      publicIp: "192.168.1.1",
      secretKey: "your_secret_key",
    });
    expect(fields.merchant_id).toBe(101);
    const expected = signChecksum(
      buildChecksumMessage({
        uuid: fields.uuid,
        merchantId: 101,
        merchantName: "TestMerchant",
        merchantEmail: "test@mail.com",
        publicIp: "192.168.1.1",
      }),
      "your_secret_key",
    );
    expect(fields.checksum).toBe(expected);
  });
});
