export const strApi = process.env.STRAPI_HOST_URL;

import axios from "axios";
import { pdf } from "pdf-to-img";
// Define allowed formats as a TypeScript type
export type DateFormat =
  | "DD-MM-YYYY"
  | "MM-DD-YYYY"
  | "MM/DD/YYYY"
  | "YYYY-MM-DD"
  | "YYYY/MM/DD"
  | "Month DD, YYYY"
  | "DD Month YYYY"
  | "DD/MM/YY"
  | "DD/MM/YYYY"; // ✅ new format added

export function formatDate(
  dateString: string,
  format: DateFormat = "DD-MM-YYYY"
): string {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date string");
  }

  const day = String(date.getDate()).padStart(2, "0"); // DD
  const month = String(date.getMonth() + 1).padStart(2, "0"); // MM (1–12)
  const year = date.getFullYear(); // YYYY
  const shortYear = String(year).slice(-2); // YY

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  switch (format) {
    case "DD-MM-YYYY":
      return `${day}-${month}-${year}`;
    case "MM-DD-YYYY":
      return `${month}-${day}-${year}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "YYYY/MM/DD":
      return `${year}/${month}/${day}`;
    case "Month DD, YYYY":
      return `${monthNames[date.getMonth()]} ${day}, ${year}`;
    case "DD Month YYYY":
      return `${day} ${monthNames[date.getMonth()]} ${year}`;
    case "DD/MM/YY":
      return `${day}/${month}/${shortYear}`;
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

export function splitAddress(address: string): {
  addressLine1: string;
  addressLine2: string;
} {
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const mid = Math.ceil(parts.length / 2);

  const addressLine1 = parts.slice(0, mid).join(", ");
  const addressLine2 = parts.slice(mid).join(", ");

  return { addressLine1, addressLine2 };
}

export function getVillageCity(address: string): string | null {
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  // Remove S/O, D/O, W/O etc. if present in first part
  if (parts[0]?.match(/^(S\/O|D\/O|W\/O)/i)) {
    parts.shift();
  }

  // Village/City usually is the next available part (first or second after removing relation)
  if (parts.length > 0) {
    return parts?.[0] || null; // return village / city
  }

  return null;
}

export async function pdfUrlToBase64(
  pdfUrl: string,
  pageNumber: number = 1
): Promise<string> {
  // 1. Download PDF as buffer
  const response = await axios.get<ArrayBuffer>(pdfUrl, {
    responseType: "arraybuffer",
  });
  const pdfBuffer = Buffer.from(response.data);

  // 2. Load PDF in pdf-to-img
  const document = await pdf(pdfBuffer, { scale: 3 });

  // 3. Get the requested page as a buffer
  const pageBuffer = await document.getPage(pageNumber);

  // 4. Convert buffer to base64
  return pageBuffer.toString("base64");
}
