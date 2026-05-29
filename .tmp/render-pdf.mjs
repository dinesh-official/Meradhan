import { pdf } from "pdf-to-img";
import fs from "node:fs/promises";
import path from "node:path";

const pdfPath = process.argv[2];
const outDir = process.argv[3];
if (!pdfPath || !outDir) {
  console.error("Usage: render-pdf.mjs <input.pdf> <out-dir>");
  process.exit(1);
}

await fs.mkdir(outDir, { recursive: true });
const doc = await pdf(pdfPath, { scale: 1.6 });
let i = 0;
for await (const image of doc) {
  i++;
  const outPath = path.join(outDir, `page-${String(i).padStart(2, "0")}.png`);
  await fs.writeFile(outPath, image);
  console.log("wrote", outPath);
}
console.log("done. pages:", i);
