import { toast } from "sonner";

export function interestPaymentDatesToFormText(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) {
    return value
      .map((x) => (x == null ? "" : String(x).trim()))
      .filter(Boolean)
      .join(", ");
  }
  return String(value).trim();
}

export function formatDateWithDayNameFromPicker(value?: string): string {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${String(d.getDate()).padStart(2, "0")}-${months[d.getMonth()]}-${d.getFullYear()} (${dayNames[d.getDay()]})`;
}

export function ddMmmYyyyToPickerValue(input?: string | null): string {
  const s = String(input ?? "").trim();
  if (!s) return "";
  const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(s);
  if (!m) return "";
  const dd = Number(m[1]);
  const monKey = (m[2] ?? "").slice(0, 3).toLowerCase();
  const yyyy = Number(m[3]);
  const MONTH: Record<string, number> = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  };
  const mm = MONTH[monKey];
  if (!mm) return "";
  return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

export function payinDateTimeToPickerValue(input?: string | null): string {
  const s = String(input ?? "").trim();
  if (!s) return "";

  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const ddMmmYyyy = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})(?:\s+.*)?$/.exec(s);
  if (ddMmmYyyy) return ddMmmYyyyToPickerValue(`${ddMmmYyyy[1]}-${ddMmmYyyy[2]}-${ddMmmYyyy[3]}`);

  return "";
}

function isValidCalendarYmd(iso: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
}

export function normalizeLastCouponDateRawInput(
  raw: string,
): { iso: string; display: string } | null {
  const t = raw.trim();
  if (t === "") return { iso: "", display: "" };

  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    if (!isValidCalendarYmd(t)) return null;
    const display = formatDateWithDayNameFromPicker(t);
    return display ? { iso: t, display } : null;
  }

  const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(t);
  if (dmy) {
    const dd = Number(dmy[1]);
    const mm = Number(dmy[2]);
    const yyyy = Number(dmy[3]);
    if (dd < 1 || dd > 31 || mm < 1 || mm > 12) return null;
    const iso = `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    if (!isValidCalendarYmd(iso)) return null;
    const display = formatDateWithDayNameFromPicker(iso);
    return display ? { iso, display } : null;
  }

  const isoLoose = payinDateTimeToPickerValue(t) || ddMmmYyyyToPickerValue(t);
  if (isoLoose && isValidCalendarYmd(isoLoose)) {
    const display = formatDateWithDayNameFromPicker(isoLoose);
    return display ? { iso: isoLoose, display } : null;
  }

  return null;
}

export type ReceiptPdfFormState = {
  pdfAutofillSettlementDate: string;
  pdfAccruedInterestDays: string;
  pdfSettlementNumber: string;
  pdfSettlementDateTime: string;
  pdfLastInterestPaymentDateRaw: string;
  pdfLastInterestPaymentDate: string;
  pdfInterestPaymentDates: string;
  pdfNonAmortizedBond: boolean;
  pdfAmortizedPrincipalPaymentDates: string;
};

export function buildPdfOptionPayload(
  state: ReceiptPdfFormState,
  accruedInterestDaysNum: number,
) {
  const settlementDateVal =
    state.pdfAutofillSettlementDate.trim() !== ""
      ? state.pdfAutofillSettlementDate.trim()
      : undefined;
  const settlementNumberVal =
    state.pdfSettlementNumber.trim() !== "" ? state.pdfSettlementNumber.trim() : undefined;
  const settlementDateTimeVal =
    state.pdfSettlementDateTime.trim() !== "" ? state.pdfSettlementDateTime.trim() : undefined;
  const lastInterestVal =
    state.pdfLastInterestPaymentDate.trim() !== ""
      ? state.pdfLastInterestPaymentDate.trim()
      : undefined;
  const interestPaymentDatesVal =
    state.pdfInterestPaymentDates.trim() !== ""
      ? state.pdfInterestPaymentDates.trim()
      : undefined;
  const amortizedPrincipalPaymentDatesVal =
    !state.pdfNonAmortizedBond && state.pdfAmortizedPrincipalPaymentDates.trim() !== ""
      ? state.pdfAmortizedPrincipalPaymentDates.trim()
      : undefined;
  return {
    accruedInterestDays: accruedInterestDaysNum,
    ...(settlementDateVal && { settlementDate: settlementDateVal }),
    ...(settlementNumberVal && { settlementNumber: settlementNumberVal }),
    ...(settlementDateTimeVal && { settlementDateTime: settlementDateTimeVal }),
    ...(lastInterestVal && { lastInterestPaymentDate: lastInterestVal }),
    ...(interestPaymentDatesVal && { interestPaymentDates: interestPaymentDatesVal }),
    nonAmortizedBond: state.pdfNonAmortizedBond,
    ...(amortizedPrincipalPaymentDatesVal && {
      amortizedPrincipalPaymentDates: amortizedPrincipalPaymentDatesVal,
    }),
  };
}

export function getValidatedAccruedInterestDays(daysRaw: string): number | null {
  if (daysRaw.trim() === "") {
    toast.error("No. of Days is required.");
    return null;
  }
  return Number(daysRaw);
}
