import { describe, it, expect } from "bun:test";
import { sanitizeIssuerHtml } from "./html-sanitizer";

describe("sanitizeIssuerHtml", () => {
  it("strips <script> tags but keeps text", () => {
    const out = sanitizeIssuerHtml("<p>hi</p><script>alert(1)</script>") ?? "";
    expect(out).toContain("hi");
    expect(out.toLowerCase()).not.toContain("script");
  });

  it("strips inline event handlers", () => {
    const out = sanitizeIssuerHtml('<p onclick="evil()">x</p>') ?? "";
    expect(out.toLowerCase()).not.toContain("onclick");
    expect(out).toContain("x");
  });

  it("keeps allowed formatting tags", () => {
    const out = sanitizeIssuerHtml("<h2>Positives</h2><ul><li>Good</li></ul>") ?? "";
    expect(out).toContain("<h2>");
    expect(out).toContain("Positives");
    expect(out).toContain("<li>");
  });

  it("returns null for empty / whitespace / null input", () => {
    expect(sanitizeIssuerHtml("")).toBeNull();
    expect(sanitizeIssuerHtml("   ")).toBeNull();
    expect(sanitizeIssuerHtml(null)).toBeNull();
    expect(sanitizeIssuerHtml(undefined)).toBeNull();
    expect(sanitizeIssuerHtml("<p></p>")).toBeNull();
  });
});
