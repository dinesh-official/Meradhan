import crypto from "crypto";

export const generateOrderNumber = () => {
  const prefix = "ORD";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Derives a short issuer/bond abbrev from security name for Deal ID.
 * Example: "VIVRITI CAPITAL LIMITED SR A 9 NCD 04NV26 FVRS10000" → "VIVRITICAPITALL"
 */
export function bondNameToDealIdAbbrev(securityName: string): string {
  if (!securityName || typeof securityName !== "string") return "BOND";
  const words = securityName.trim().split(/\s+/).filter(Boolean);
  const firstThree = words.slice(0, 3);
  const joined = firstThree.join("").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return joined || "BOND";
}

/**
 * Generates a unique MeraDhan Deal ID for an order. One ID per order, stored in order.metadata.dealId.
 *
 * Format: MD-{BOND_ABBREV}-ASSIST-{DDMMYYYY}-{BUY|SELL}-{ORDER_ROW_ID}
 *
 * Example: MD-VIVRITICAPITALL-ASSIST-20022026-BUY-012
 *
 * | Part  | Segment       | Meaning                    | Example        |
 * |-------|----------------|----------------------------|----------------|
 * | PART1 | MD             | Fixed prefix (MeraDhan)     | MD             |
 * | PART2 | Bond abbrev    | From security name (no spaces) | VIVRITICAPITALL |
 * | PART3 | ASSIST         | Fixed literal              | ASSIST         |
 * | PART4 | 8 digits       | Date DDMMYYYY              | 20022026       |
 * | PART5 | BUY/SELL       | Deal type                  | BUY            |
 * | PART6 | 6 digits       | Order table row id         | 012            |
 */
export function generateDealId(
  date: Date,
  action: "BUY" | "SELL" | "BOTH",
  orderRowId: number,
  bondName: string
): string {
  const prefix = "MD";
  const bondAbbrev = generateCode(bondName);
  const assist = "ASSIST";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const formattedDate = `${dd}${mm}${yyyy}`;
  const orderSuffix =
    orderRowId != null && Number.isInteger(orderRowId)
      ? String(orderRowId).padStart(6, "0").slice(-6)
      : String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  return `${prefix}-${bondAbbrev}-${assist}-${formattedDate}-${action}-${orderSuffix}`;
}


export function generateCode(input: string) {
  const words = input.trim().split(/\s+/);

  if (words.length <= 2) {
    return words.join("");
  }

  const firstTwo = words.slice(0, 2).join("");
  const initials = words.slice(2).map(w => w[0]).join("");

  return firstTwo + initials;
}

export function generateOrderId({
  prefix1 = "MD",
  prefix2 = "DIR",
  action = "BUY",
  date = new Date(),
  uniquePart = crypto.randomBytes(3).toString("hex").toUpperCase(),
}: {
  prefix1?: string;
  prefix2?: string;
  action?: string;
  date?: Date;
  uniquePart?: string;
}) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  const formattedDate = `${dd}${mm}${yyyy}`;

  // 3 bytes → 6 hex chars → extremely low collision probability

  return `${prefix1}-${prefix2}-${formattedDate}-${action}-${uniquePart}`;
}
