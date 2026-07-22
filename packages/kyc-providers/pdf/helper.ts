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
  const raw = String(dateString ?? "").trim();
  // Calendar dates (YYYY-MM-DD) must not go through UTC Date parsing —
  // `new Date("2026-07-16")` is UTC midnight and can shift the local day.
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  const date = ymd
    ? new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]), 12, 0, 0, 0)
    : new Date(raw);

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

/**
 * Prefer exact RFQ-saved calendar labels (DD-MMM-YYYY). Otherwise format via
 * formatDate. Empty → "N/A" unless a fallback ISO/ymd is provided.
 */
export function formatPdfCalendarDate(
  preferred?: string | null,
  fallback?: string | null,
): string {
  const raw = String(preferred ?? "").trim();
  if (/^\d{1,2}-[A-Za-z]{3}-\d{4}$/i.test(raw)) {
    const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/i.exec(raw)!;
    const dd = String(Number(m[1])).padStart(2, "0");
    const monKey = (m[2] ?? "").toLowerCase();
    const mon =
      monKey.charAt(0).toUpperCase() + monKey.slice(1, 3);
    return `${dd}-${mon}-${m[3]}`;
  }
  if (raw) return formatDate(raw, "DD-MMM-YYYY");
  const fb = String(fallback ?? "").trim();
  if (fb) return formatDate(fb, "DD-MMM-YYYY");
  return "N/A";
}

const MONTH_SHORT_TO_INDEX: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/**
 * Settlement Date & Time for deal/receipt PDFs:
 * - date always as DD-MMM-YYYY
 * - append HH:MM:SS only when a real time is present
 */
export function formatPdfSettlementDateTime(
  ...candidates: Array<string | null | undefined>
): string {
  const monthNamesShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formatParts = (
    day: number,
    monthIndex: number,
    year: number,
    hh?: number,
    mm?: number,
    ss?: number,
    hasTime?: boolean,
  ): string => {
    const datePart = `${String(day).padStart(2, "0")}-${monthNamesShort[monthIndex]}-${year}`;
    if (!hasTime) return datePart;
    const timePart = `${String(hh ?? 0).padStart(2, "0")}:${String(mm ?? 0).padStart(2, "0")}:${String(ss ?? 0).padStart(2, "0")}`;
    return `${datePart} ${timePart}`;
  };

  for (const candidate of candidates) {
    const raw = String(candidate ?? "").trim();
    if (!raw) continue;

    // "23-Jul-2026 17:30:00" or "23-Jul-2026"
    const ddMmm = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})(?:[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/i.exec(
      raw,
    );
    if (ddMmm) {
      const day = Number(ddMmm[1]);
      const monKey = (ddMmm[2] ?? "").slice(0, 3).toLowerCase();
      const monthIndex = MONTH_SHORT_TO_INDEX[monKey];
      const year = Number(ddMmm[3]);
      if (monthIndex == null || !Number.isFinite(day) || !Number.isFinite(year)) {
        continue;
      }
      const hasTime = ddMmm[4] != null;
      return formatParts(
        day,
        monthIndex,
        year,
        Number(ddMmm[4] ?? 0),
        Number(ddMmm[5] ?? 0),
        Number(ddMmm[6] ?? 0),
        hasTime,
      );
    }

    // YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS...
    const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(raw);
    if (iso) {
      const year = Number(iso[1]);
      const monthIndex = Number(iso[2]) - 1;
      const day = Number(iso[3]);
      const hasTime = iso[4] != null;
      if (
        !Number.isFinite(year) ||
        monthIndex < 0 ||
        monthIndex > 11 ||
        !Number.isFinite(day)
      ) {
        continue;
      }
      return formatParts(
        day,
        monthIndex,
        year,
        Number(iso[4] ?? 0),
        Number(iso[5] ?? 0),
        Number(iso[6] ?? 0),
        hasTime,
      );
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      const hasTime = /[T ]\d{1,2}:\d{2}/.test(raw);
      return formatParts(
        parsed.getDate(),
        parsed.getMonth(),
        parsed.getFullYear(),
        parsed.getHours(),
        parsed.getMinutes(),
        parsed.getSeconds(),
        hasTime,
      );
    }
  }

  return "N/A";
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

  const detectedMime = mimeType || response.headers["content-type"]?.split(";")?.[0] || "image/png";
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

/**
 * Truncate toward zero to `decimals` places via string slicing (does not round).
 * When `formatted` is true, returns a comma-grouped string (e.g. "1,234.56").
 */
export function truncateDecimals(
  value: number | string,
  decimals?: number,
  formatted?: false,
): number;
export function truncateDecimals(
  value: number | string,
  decimals: number | undefined,
  formatted: true,
): string;
export function truncateDecimals(
  value: number | string,
  decimals = 2,
  formatted = false,
): number | string {
  const str = (typeof value === "string" ? value : String(value)).trim();
  const negative = str.startsWith("-");
  const raw = negative ? str.slice(1) : str;

  const dot = raw.indexOf(".");
  const intPart = dot === -1 ? raw : raw.slice(0, dot);
  const decPart = dot === -1 ? "" : raw.slice(dot + 1, dot + 1 + decimals);
  const sign = negative ? "-" : "";

  if (formatted) {
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (decimals === 0) {
      return `${sign}${withCommas}`;
    }
    return `${sign}${withCommas}.${decPart.padEnd(decimals, "0")}`;
  }

  if (!decPart || /^0+$/.test(decPart)) {
    return Number(`${sign}${intPart}`);
  }

  const trimmed = decPart.replace(/0+$/, "");
  const result = trimmed
    ? `${sign}${intPart}.${trimmed}`
    : `${sign}${intPart}`;
  return Number(result);
}

/** Popup / PDF security label: `{Coupon}% {bondName} Maturity date {date}` */
export function formatBondSecurityLabel(bond: {
  couponRate?: number | null;
  bondName?: string | null;
  maturityDate?: string | null;
}): string {
  const coupon = bond.couponRate != null && Number.isFinite(Number(bond.couponRate))
    ? Number(bond.couponRate).toFixed(2)
    : "N/A";
  const name = (bond.bondName ?? "").trim() || "N/A";
  const maturity = bond.maturityDate
    ? formatDate(bond.maturityDate, "DD-MMM-YYYY")
    : "N/A";
  return `${coupon}% ${name} Maturity ${maturity}`;
}
