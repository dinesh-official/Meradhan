import { describe, expect, test } from "bun:test";
import {
  buildDeriDataAuth,
  buildDeriDataChecksum,
  buildDeriDataChecksumMessage,
  buildDeriDataUuid,
} from "./deridata.auth";

describe("deridata.auth", () => {
  test("buildDeriDataUuid matches merchant_id|timestamp|random format", () => {
    const uuid = buildDeriDataUuid(29);
    const parts = uuid.split("|");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe("29");
    expect(Number(parts[1])).toBeGreaterThan(0);
    expect(Number(parts[2])).toBeGreaterThan(0);
  });

  test("buildDeriDataChecksum is stable base64 for same inputs", () => {
    const message =
      "29|1782987779211|123456|29|Meradhan|ops@meradhan.co|1.2.3.4";
    const a = buildDeriDataChecksum("test-secret", message);
    const b = buildDeriDataChecksum("test-secret", message);
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(20);
  });

  test("buildDeriDataChecksumMessage uses official field order", () => {
    const message = buildDeriDataChecksumMessage({
      uuid: "29|1782987779211|123456",
      merchantId: 29,
      merchantName: "Meradhan",
      merchantEmail: "ops@meradhan.co",
      publicIp: "1.2.3.4",
    });
    expect(message).toBe(
      "29|1782987779211|123456|29|Meradhan|ops@meradhan.co|1.2.3.4",
    );
  });

  test("buildDeriDataAuth returns uuid and checksum", () => {
    const auth = buildDeriDataAuth({
      merchantId: 29,
      secretKey: "secret",
      merchantName: "Meradhan",
      merchantEmail: "ops@meradhan.co",
      publicIp: "1.2.3.4",
    });
    expect(auth.uuid.startsWith("29|")).toBe(true);
    expect(auth.message.includes("|29|Meradhan|ops@meradhan.co|1.2.3.4")).toBe(
      true,
    );
    expect(auth.checksum.length).toBeGreaterThan(10);
  });
});
