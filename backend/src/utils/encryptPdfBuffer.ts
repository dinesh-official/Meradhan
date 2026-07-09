import { execFileSync } from "child_process";
import { randomBytes } from "crypto";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

/**
 * Resolve `qpdf` binary: env override, then common Homebrew paths (workers often
 * have a minimal PATH without `/opt/homebrew/bin`), then `qpdf` on PATH.
 */
function resolveQpdfBinary(): string {
  const fromEnv = process.env.QPDF_BIN?.trim();
  if (fromEnv) return fromEnv;

  const homebrewApple = "/opt/homebrew/bin/qpdf";
  const homebrewIntel = "/usr/local/bin/qpdf";
  if (existsSync(homebrewApple)) return homebrewApple;
  if (existsSync(homebrewIntel)) return homebrewIntel;

  return "qpdf";
}

/**
 * Password-protect a PDF using the `qpdf` CLI (AES-256).
 * Install: macOS `brew install qpdf`, Debian `apt install qpdf`.
 * Optional: `QPDF_BIN=/path/to/qpdf` if the binary is not on `PATH`.
 */
export function encryptPdfBufferWithPassword(pdfBuffer: Buffer, password: string): Buffer {
  if (!password || password.trim() === "") {
    throw new Error("PDF encryption password is empty");
  }
  const id = randomBytes(8).toString("hex");
  const inPath = join(tmpdir(), `md-pdf-in-${id}.pdf`);
  const outPath = join(tmpdir(), `md-pdf-out-${id}.pdf`);
  const qpdfBin = resolveQpdfBinary();
  try {
    writeFileSync(inPath, pdfBuffer);
    execFileSync(
      qpdfBin,
      ["--encrypt", password, password, "256", "--", inPath, outPath],
      { stdio: "pipe" },
    );
    return readFileSync(outPath);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `PDF encryption failed (${msg}). Install qpdf (e.g. macOS: brew install qpdf), or set QPDF_BIN to the full path (e.g. /opt/homebrew/bin/qpdf). Tried binary: ${qpdfBin}`,
    );
  } finally {
    try {
      unlinkSync(inPath);
    } catch {
      /* ignore */
    }
    try {
      unlinkSync(outPath);
    } catch {
      /* ignore */
    }
  }
}
