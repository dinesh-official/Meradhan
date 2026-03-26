import crypto from "crypto";
export function calculateSettlementAmount(
  issuePrice: number,
  quantity: number
): number {
  // stampduty and other charges are currently not implemented 0.0001%
  const stampDutyRate = 0.0001;
  const stampDuty = issuePrice * quantity * stampDutyRate;
  return issuePrice * quantity + stampDuty;
}

export function generateOrderId({
  prefix1 = "MD",
  prefix2 = "DIR",
  action = "BUY",
  date = new Date(),
}: {
  prefix1?: string;
  prefix2?: string;
  action?: string;
  date?: Date;
}) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  const formattedDate = `${dd}${mm}${yyyy}`;

  // 3 bytes → 6 hex chars → extremely low collision probability
  const uniquePart = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `${prefix1}-${prefix2}-${formattedDate}-${action}-${uniquePart}`;
}
