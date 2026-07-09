export const generateOrderNumber = () => {
  const prefix = "ORD";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${timestamp}-${random}`;
};

export type OrderChannel = "ASSIST" | "DIR";
export type OrderAction = "BUY" | "SELL" | "BOTH";

/** Auto-increment suffix (order row id), zero-padded (min 3 chars). */
export function formatOrderSequenceSuffix(seq: number): string {
  if (!Number.isFinite(seq) || seq < 0) return "000";
  return String(Math.floor(seq)).padStart(3, "0");
}

export function formatDateDdMmYyyy(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}${mm}${yyyy}`;
}
export function formatDateIstDdMmmYyyy(date: Date): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short", // directly gives "Jan", "Feb", etc.
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = fmt.formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const dd = get("day");
  const mmm = get("month"); // already short format
  const yyyy = get("year");
  const hh = get("hour");
  const mm = get("minute");
  const ss = get("second");

  return `${dd}-${mmm}-${yyyy}`;
}
/**
 * Issuer segment for Deal ID: first word full caps, second word full caps,
 * remaining words first letter only (e.g. KOSAMATTAM FINANCE LIMITED → KOSAMATTAMFINANCEL).
 */
export function encodeIssuerForDealId(issuerName: string): string {
  const cleaned = issuerName.trim().replace(/\s+/g, " ");
  if (!cleaned) return "UNKNOWN";
  const words = cleaned.split(" ").filter(Boolean);
  const alpha = (w: string) => w.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (words.length === 0) return "UNKNOWN";
  const wFirst = words[0] as string;
  if (words.length === 1) return alpha(wFirst) || "UNKNOWN";
  const w0 = alpha(wFirst);
  const w1 = alpha(words[1] as string);
  const rest = words
    .slice(2)
    .map((w) => (alpha(w)[0] ?? ""))
    .join("");
  const out = `${w0}${w1}${rest}`;
  return out || "UNKNOWN";
}

function normalizeActionForId(action: OrderAction): "BUY" | "SELL" {
  if (action === "SELL") return "SELL";
  return "BUY";
}

/**
 * MeraDhan Order ID: MD-{ASSIST|DIR}-{DDMMYYYY}-{BUY|SELL}-{XXX}
 * XXX = order table id (auto-increment), not random.
 */
export function generateOrderId(params: {
  channel: OrderChannel;
  action: OrderAction;
  date: Date;
  orderSequence: number;
}): string {
  const a = normalizeActionForId(params.action);
  const dateStr = formatDateDdMmYyyy(params.date);
  const seq = formatOrderSequenceSuffix(params.orderSequence);
  return `MD-${params.channel}-${dateStr}-${a}-${seq}`;
}

/**
 * MeraDhan Deal ID: MD-{ISSUER}-{ASSIST|DIR}-{DDMMYYYY}-{BUY|SELL}-{XXX}
 * Same date and sequence as the paired Order ID.
 */
export function generateDealId(params: {
  issuerName: string;
  channel: OrderChannel;
  action: OrderAction;
  date: Date;
  orderSequence: number;
}): string {
  const issuer = encodeIssuerForDealId(params.issuerName);
  const a = normalizeActionForId(params.action);
  const dateStr = formatDateDdMmYyyy(params.date);
  const seq = formatOrderSequenceSuffix(params.orderSequence);
  return `MD-${issuer}-${params.channel}-${dateStr}-${a}-${seq}`;
}

/** @deprecated Use encodeIssuerForDealId */
export function bondNameToDealIdAbbrev(securityName: string): string {
  return encodeIssuerForDealId(securityName);
}
