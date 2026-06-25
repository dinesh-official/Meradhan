import type { BondDetailsResponse } from "@root/apiGateway";

type SettleOrderMeta = {
  modQuantity?: number | string | null;
  modAccrInt?: number | string | null;
  modConsideration?: number | string | null;
  stampDutyAmount?: number | string | null;
};

type OrderPdfMetadata = {
  accruedInterest?: number;
  accruedInterestDays?: number;
  settleOrder?: SettleOrderMeta;
};

type OrderPdfInput = {
  subTotal?: number;
  stampDuty?: number;
  totalAmount?: number;
  price?: number;
  metadata?: OrderPdfMetadata;
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
 * Priority: NSE settle_order → bond DB (autofill) → order checkout snapshot → computed fallback.
 */
export function resolveOrderPdfFinancials(params: {
  bond: Pick<
    BondDetailsResponse,
    | "faceValue"
    | "sellPrice"
    | "accruedInterest"
    | "accruedInterestDays"
    | "settlementAmount"
    | "principalAmount"
    | "totalConsideration"
  >;
  orderData?: OrderPdfInput;
  qun: number;
}): {
  effectiveQty: number;
  principalAmount: number;
  accruedInterest: number;
  accruedInterestDays: number | null;
  stampDutyAmount: number;
  totalConsideration: number;
  settlementAmount: number;
} {
  const { bond, orderData, qun } = params;
  const settleOrder = orderData?.metadata?.settleOrder;

  const effectiveQty =
    settleOrder?.modQuantity != null
      ? Math.max(1, Math.round(Number(settleOrder.modQuantity)))
      : Math.max(1, Math.round(qun));

  const bondAccruedPerUnit = toNum(bond.accruedInterest);
  const bondSettlementPerUnit = toNum(bond.settlementAmount);
  const bondPrincipalPerUnit = toNum(bond.principalAmount);
  const bondConsiderationPerUnit = toNum(bond.totalConsideration);
  const bondAccruedDays = toNum(bond.accruedInterestDays);

  const accruedInterest =
    firstNum(
      settleOrder?.modAccrInt,
      orderData?.metadata?.accruedInterest,
      bondAccruedPerUnit != null ? bondAccruedPerUnit * effectiveQty : null,
    ) ?? 0;

  const stampDutyAmount =
    firstNum(settleOrder?.stampDutyAmount, orderData?.stampDuty) ?? 0;

  const principalFromSettle =
    settleOrder?.modConsideration != null && settleOrder?.modAccrInt != null
      ? Number(settleOrder.modConsideration) - Number(settleOrder.modAccrInt)
      : null;

  const cleanPricePct =
    firstNum(orderData?.price, bond.sellPrice) ?? 100;
  const faceValue = toNum(bond.faceValue) ?? 1000;

  const principalAmount =
    firstNum(
      orderData?.subTotal,
      principalFromSettle,
      bondPrincipalPerUnit != null ? bondPrincipalPerUnit * effectiveQty : null,
      (faceValue * effectiveQty * cleanPricePct) / 100,
    ) ?? 0;

  const totalConsideration =
    firstNum(
      settleOrder?.modConsideration,
      bondConsiderationPerUnit != null
        ? bondConsiderationPerUnit * effectiveQty
        : null,
      principalAmount + accruedInterest,
    ) ?? 0;

  const settlementAmount =
    firstNum(
      settleOrder?.modConsideration != null
        ? Number(settleOrder.modConsideration) + stampDutyAmount
        : null,
      bondSettlementPerUnit != null ? bondSettlementPerUnit * effectiveQty : null,
      totalConsideration + stampDutyAmount,
    ) ?? 0;

  const accruedInterestDays =
    firstNum(orderData?.metadata?.accruedInterestDays, bondAccruedDays);

  return {
    effectiveQty,
    principalAmount,
    accruedInterest,
    accruedInterestDays,
    stampDutyAmount,
    totalConsideration,
    settlementAmount,
  };
}
