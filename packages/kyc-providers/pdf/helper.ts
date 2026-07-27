export const strApi = process.env.NEXT_PUBLIC_STRAPI_HOST_URL;

import { env } from "@packages/config/env";
import { getEmailSalutationFromSources, type GenderSources } from "@root/schema";
import axios from "axios";
import { pdf } from "pdf-to-img";
// Define allowed formats as a TypeScript type
export type DateFormat =
  | "DD-MM-YYYY"
  | "DD-MMM-YYYY"
  | "MM-DD-YYYY"
  | "MM/DD/YYYY"
  | "YYYY-MM-DD"
  | "YYYY/MM/DD"
  | "Month DD, YYYY"
  | "DD Month YYYY"
  | "DD/MM/YY"
  | "DD/MM/YYYY";

export function formatDate(
  dateString: string,
  format: DateFormat = "DD-MM-YYYY"
): string {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return dateString;
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
  const monthNamesShort = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  switch (format) {
    case "DD-MM-YYYY":
      return `${day}-${month}-${year}`;
    case "DD-MMM-YYYY":
      return `${day}-${monthNamesShort[date.getMonth()]}-${year}`;
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

/** Receipt/deal PDF: show Last IP as DD-MMM-YYYY (DayName); accepts YYYY-MM-DD from calc API. */
export function formatLastInterestPaymentDateDisplay(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  if (/^\d{1,2}-[A-Za-z]{3}-\d{4}/.test(trimmed)) {
    return trimmed;
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) {
    const dt = new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3]),
      12,
      0,
      0,
      0,
    );
    if (!Number.isNaN(dt.getTime())) {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return `${formatDate(dt.toISOString(), "DD-MMM-YYYY")} (${dayNames[dt.getDay()]})`;
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return `${formatDate(parsed.toISOString(), "DD-MMM-YYYY")} (${dayNames[parsed.getDay()]})`;
  }

  return trimmed;
}

type PdfGreetingUser = Pick<
  GenderSources,
  "gender" | "panCard" | "aadhaarCard"
> & {
  id: number;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
};

/** NSE RFQ participants use a shim user with a negative id. */
export function isNseRfqParticipantUser(
  user: Pick<PdfGreetingUser, "id">,
  orderData?: { metadata?: { isRfqParticipant?: boolean } },
): boolean {
  return user.id < 0 || orderData?.metadata?.isRfqParticipant === true;
}

export function getPdfDearGreeting(
  user: PdfGreetingUser,
  orderData?: { metadata?: { isRfqParticipant?: boolean } },
): string {
  if (isNseRfqParticipantUser(user, orderData)) {
    return "Dear Sir / Madam,";
  }
  const fullname =
    (user.firstName ?? "") +
    `${user.middleName ? `${user.middleName} ` : " "}` +
    (user.lastName ?? "");
  const salutation = getEmailSalutationFromSources({
    gender: user?.gender,
    panCard: user?.panCard,
    aadhaarCard: user?.aadhaarCard,
  });
  return `Dear ${salutation} ${fullname},`;
}

export type ClientSettlementBankSource = {
  bankName?: string | null;
  ifscCode?: string | null;
  accountNo?: string | null;
  accountNumber?: string | null;
};

export type ClientSettlementDematSource = {
  dpName?: string | null;
  depositoryParticipantName?: string | null;
  dpId?: string | null;
  benId?: string | null;
  clientId?: string | null;
};

function isProvidedSettlementValue(value: unknown): boolean {
  const s = String(value ?? "").trim();
  return s.length > 0 && s !== "—" && s !== "N/A" && s !== "undefined";
}

export function hasClientSettlementBankInfo(
  bank: ClientSettlementBankSource | null | undefined,
): boolean {
  if (!bank) return false;
  return (
    isProvidedSettlementValue(bank.bankName) &&
    isProvidedSettlementValue(bank.ifscCode) &&
    isProvidedSettlementValue(bank.accountNo ?? bank.accountNumber)
  );
}

export function hasClientSettlementDematInfo(
  demat: ClientSettlementDematSource | null | undefined,
): boolean {
  if (!demat) return false;
  return (
    isProvidedSettlementValue(demat.dpName ?? demat.depositoryParticipantName) &&
    isProvidedSettlementValue(demat.benId ?? demat.clientId)
  );
}

/** NSE participants: show only when both bank and demat details are on file. */
export function shouldShowClientSettlementDetails(
  user: Pick<PdfGreetingUser, "id">,
  orderData?: { metadata?: { isRfqParticipant?: boolean } },
  bank?: ClientSettlementBankSource | null,
  demat?: ClientSettlementDematSource | null,
): boolean {
  if (!isNseRfqParticipantUser(user, orderData)) {
    return true;
  }
  return (
    hasClientSettlementBankInfo(bank) && hasClientSettlementDematInfo(demat)
  );
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

export async function getFileUrlToBuffer(file: string) {
  const token = "meradhan24873284sadsrFAD";
  const url =
    env.NEXT_PUBLIC_BACKEND_HOST_URL +
    "/files-public" +
    file +
    `?token=${token}`;
  const response = await axios.get<ArrayBuffer>(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
}

export async function getFileDataUri(
  file: string,
  mimeType?: string
) {
  if (!file) return "";

  const url = getFileUrl(file);

  const response = await axios.get<ArrayBuffer>(url, {
    responseType: "arraybuffer",
  });

  const contentType = response.headers["content-type"];
  const detectedMime =
    mimeType ||
    (typeof contentType === "string" ? contentType.split(";")[0] : undefined) ||
    "image/png";
  const buffer = Buffer.from(response.data);


  return `data:${detectedMime};base64,${buffer.toString("base64")}`;
}

export const getFileUrl = (file: string) => {
  const token = "meradhan24873284sadsrFAD";
  const url =
    env.NEXT_PUBLIC_BACKEND_HOST_URL +
    "/files-public" +
    file +
    `?token=${token}`;
  return url;
};
