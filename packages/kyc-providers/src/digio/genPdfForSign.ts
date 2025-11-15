import path from "path";
import { fileURLToPath } from "url";

export const genPdfForSign = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const file = path.join(__dirname, "pdf.pdf");
  return file;
};
