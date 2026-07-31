type SettleOrderMeta = {
  modQuantity?: number | string | null;
  modAccrInt?: number | string | null;
  modConsideration?: number | string | null;
  stampDutyAmount?: number | string | null;
  price?: number | string | null;
};

type OrderPdfMetadata = {
  accruedInterest?: number;
  accruedInterestDays?: number;
  settleOrder?: SettleOrderMeta;
};

type OrderPdfPricingSnapshot = {
  cleanPrice?: unknown;
  principalAmount?: unknown;
  accruedInterest?: unknown;
  totalConsideration?: unknown;
  settlementAmount?: unknown;
  stampDuty?: unknown;
  noOfAccrualDays?: unknown;
  yield?: unknown;
};

type OrderPdfInput = {
  subTotal?: number;
  stampDuty?: number;
  totalAmount?: number;
  price?: number;
  metadata?: OrderPdfMetadata;
  /** Checkout pricing snapshot from `order.bondDetails.pricing` — never bond master DB amounts. */
  bondDetails?: { pricing?: OrderPdfPricingSnapshot } | null;
};

function toNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function firstNum(...values: unknown[]): number | null {
  for (const v of values) {
    const n = toNum(v);
    if (n != null) return n;
  }
  return null;
}

/**
 * Resolves principal, accrued interest, consideration, and settlement for order PDFs.
 * Priority: NSE settle_order → order checkout pricing snapshot → order row amounts.
 * Does not read calculated pricing fields from the bonds master table.
 */
export function resolveOrderPdfFinancials(params: {
  orderData?: OrderPdfInput;
  qun: number;
  /** Face value used only if principal cannot be derived from settle/order/snapshot. */
  faceValue?: number | null;
}): {
  effectiveQty: number;
  principalAmount: number;
  accruedInterest: number;
  accruedInterestDays: number | null;
  stampDutyAmount: number;
  totalConsideration: number;
  settlementAmount: number;
  cleanPrice: number | null;
} {
  const { orderData, qun } = params;
  const settleOrder = orderData?.metadata?.settleOrder;
  const orderPricing = orderData?.bondDetails?.pricing;

  const effectiveQty =
    settleOrder?.modQuantity != null
      ? Math.max(1, Math.round(Number(settleOrder.modQuantity)))
      : Math.max(1, Math.round(qun));

  const accruedInterest =
    firstNum(
      settleOrder?.modAccrInt,
      orderData?.metadata?.accruedInterest,
      orderPricing?.accruedInterest,
    ) ?? 0;

  const stampDutyAmount =
    firstNum(
      settleOrder?.stampDutyAmount,
      orderPricing?.stampDuty,
      orderData?.stampDuty,
    ) ?? 0;

  const principalFromSettle =
    settleOrder?.modConsideration != null && settleOrder?.modAccrInt != null
      ? Number(settleOrder.modConsideration) - Number(settleOrder.modAccrInt)
      : null;

  const cleanPrice = firstNum(
    settleOrder?.price,
    orderPricing?.cleanPrice,
    orderData?.price,
  );

  const faceValue = toNum(params.faceValue) ?? 1000;

  const principalAmount =
    firstNum(
      orderPricing?.principalAmount,
      orderData?.subTotal,
      principalFromSettle,
      cleanPrice != null ? (faceValue * effectiveQty * cleanPrice) / 100 : null,
    ) ?? 0;

  const totalConsideration =
    firstNum(
      settleOrder?.modConsideration,
      orderPricing?.totalConsideration,
      orderData?.totalAmount,
      principalAmount + accruedInterest,
    ) ?? 0;

  // Label on PDF is "Settlement Amount (inclusive of Stamp Duty)".
  // Always add stamp duty here — do not trust a snapshot that may omit it.
  const settlementAmount = totalConsideration + stampDutyAmount;

  const accruedInterestDays = firstNum(
    orderData?.metadata?.accruedInterestDays,
    orderPricing?.noOfAccrualDays,
  );

  return {
    effectiveQty,
    principalAmount,
    accruedInterest,
    accruedInterestDays,
    stampDutyAmount,
    totalConsideration,
    settlementAmount,
    cleanPrice,
  };
}
