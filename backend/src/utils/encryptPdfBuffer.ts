import { execFileSync } from "child_process";
import { randomBytes } from "crypto";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

/**
 * Password-protect a PDF using the `qpdf` CLI (AES-256).
 * Install: macOS `brew install qpdf`, Debian `apt install qpdf`.
 */
export function encryptPdfBufferWithPassword(pdfBuffer: Buffer, password: string): Buffer {
  if (!password || password.trim() === "") {
    throw new Error("PDF encryption password is empty");
  }
  const id = randomBytes(8).toString("hex");
  const inPath = join(tmpdir(), `md-pdf-in-${id}.pdf`);
  const outPath = join(tmpdir(), `md-pdf-out-${id}.pdf`);
  try {
    writeFileSync(inPath, pdfBuffer);
    const qpdfBin = process.env.QPDF_BIN?.trim() || "qpdf";
    execFileSync(
      qpdfBin,
      ["--encrypt", password, password, "256", "--", inPath, outPath],
      { stdio: "pipe" },
    );
    return readFileSync(outPath);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `PDF encryption failed (${msg}). Install qpdf and ensure it is on PATH, or set QPDF_BIN to the qpdf binary path.`,
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
