export function calculateSettlementAmount(
  issuePrice: number,
  quantity: number
): number {
  // stampduty and other charges are currently not implemented 0.0001%
  const stampDutyRate = 0.0001;
  const stampDuty = issuePrice * quantity * stampDutyRate;
  return issuePrice * quantity + stampDuty;
}

/**
 * Label shown before payment is initiated. Final Order ID is assigned by the server
 * when you proceed to pay (format MD-DIR-DDMMYYYY-BUY-XXX with auto-increment XXX).
 */
export function generateDraftPlaceOrderLabel(date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `MD-DIR-${dd}${mm}${yyyy}-BUY-DRAFT`;
}
