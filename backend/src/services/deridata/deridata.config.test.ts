import { describe, expect, test } from "bun:test";
import {
  DEFAULT_DERIDATA_BASE_URL,
  faceAmountInCrores,
  getDeriDataConfig,
} from "./deridata.config";

describe("deridata.config", () => {
  test("faceAmountInCrores converts face value and quantity to crores", () => {
    expect(faceAmountInCrores(10000, 1)).toBe(0.001);
    expect(faceAmountInCrores(100000, 10)).toBe(0.1);
  });

  test("getDeriDataConfig uses default base URL when unset", () => {
    const prev = {
      base: process.env.DERIDATA_BASE_URL,
      id: process.env.DERIDATA_MERCHANT_ID,
      secret: process.env.DERIDATA_SECRET_KEY,
      name: process.env.DERIDATA_MERCHANT_NAME,
      email: process.env.DERIDATA_MERCHANT_EMAIL,
      ip: process.env.DERIDATA_PUBLIC_IP,
    };
    delete process.env.DERIDATA_BASE_URL;
    process.env.DERIDATA_MERCHANT_ID = "29";
    process.env.DERIDATA_SECRET_KEY = "test-secret";
    process.env.DERIDATA_MERCHANT_NAME = "Meradhan";
    process.env.DERIDATA_MERCHANT_EMAIL = "ops@meradhan.co";
    process.env.DERIDATA_PUBLIC_IP = "1.2.3.4";

    try {
      const cfg = getDeriDataConfig();
      expect(cfg.baseUrl).toBe(DEFAULT_DERIDATA_BASE_URL);
      expect(cfg.merchantId).toBe(29);
      expect(cfg.merchantName).toBe("Meradhan");
    } finally {
      if (prev.base === undefined) delete process.env.DERIDATA_BASE_URL;
      else process.env.DERIDATA_BASE_URL = prev.base;
      if (prev.id === undefined) delete process.env.DERIDATA_MERCHANT_ID;
      else process.env.DERIDATA_MERCHANT_ID = prev.id;
      if (prev.secret === undefined) delete process.env.DERIDATA_SECRET_KEY;
      else process.env.DERIDATA_SECRET_KEY = prev.secret;
      if (prev.name === undefined) delete process.env.DERIDATA_MERCHANT_NAME;
      else process.env.DERIDATA_MERCHANT_NAME = prev.name;
      if (prev.email === undefined) delete process.env.DERIDATA_MERCHANT_EMAIL;
      else process.env.DERIDATA_MERCHANT_EMAIL = prev.email;
      if (prev.ip === undefined) delete process.env.DERIDATA_PUBLIC_IP;
      else process.env.DERIDATA_PUBLIC_IP = prev.ip;
    }
  });
});
