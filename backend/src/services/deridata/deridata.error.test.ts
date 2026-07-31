import { describe, expect, test } from "bun:test";
import { parseDeriDataErrorBody } from "./deridata.error";

describe("parseDeriDataErrorBody", () => {
  test("prefers JSON message fields", () => {
    expect(
      parseDeriDataErrorBody(JSON.stringify({ message: "bad isin" })),
    ).toBe("bad isin");
    expect(
      parseDeriDataErrorBody(JSON.stringify({ error: "auth failed" })),
    ).toBe("auth failed");
  });

  test("extracts Django DEBUG exception type and value", () => {
    const html = `
<!DOCTYPE html>
<html>
<head><title>OSError at /api/public/merchant/v1/calculator/</title></head>
<body>
<table>
<tr><th>Exception Type:</th><td>OSError</td></tr>
<tr><th>Exception Value:</th><td>[Errno 22] Invalid argument</td></tr>
</table>
</body>
</html>`;

    expect(parseDeriDataErrorBody(html)).toBe(
      "OSError: [Errno 22] Invalid argument",
    );
  });

  test("falls back to title when exception rows missing", () => {
    const html = `<html><title>OSError at /api/public/merchant/v1/calculator/</title></html>`;
    expect(parseDeriDataErrorBody(html)).toBe(
      "OSError at /api/public/merchant/v1/calculator/",
    );
  });

  test("does not return huge HTML blobs", () => {
    const html = `<!DOCTYPE html><html>${"x".repeat(50_000)}</html>`;
    const msg = parseDeriDataErrorBody(html);
    expect(msg.length).toBeLessThan(200);
    expect(msg).toContain("internal server error");
  });

  test("truncates long plain text", () => {
    const msg = parseDeriDataErrorBody("e".repeat(500));
    expect(msg.endsWith("…")).toBe(true);
    expect(msg.length).toBeLessThanOrEqual(281);
  });
});
