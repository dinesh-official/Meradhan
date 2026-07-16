import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type {
  BondDetailsResponse,
  CustomerByIdPayload,
} from "@root/apiGateway";
import {
  formatBondSecurityLabel,
  formatDate,
  formatLastInterestPaymentDateDisplay,
  getPdfDearGreeting,
} from "../helper";
import { getInterestPaymentSchedule } from "./interestPaymentSchedule";
import { resolveOrderPdfFinancials } from "./resolveOrderPdfFinancials";

const styles = StyleSheet.create({
  section: {
    marginBottom: 9,
  },
  bold: {
    fontWeight: "semibold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#cccccc",
  },
  leftLabel: {
    width: "25%",
    paddingVertical: 2,
    paddingHorizontal: 5,
    fontSize: 9,
  },
  rightValue: {
    width: "68%",
    textAlign: "left",
    borderLeftWidth: 1,
    paddingLeft: 5,
    // paddingVertical: 2,
    borderLeftColor: "#cccccc",
    fontSize: 9,
  },
});

interface OrderData {
  subTotal?: number;
  stampDuty?: number;
  totalAmount?: number;
  createdAt?: string;
  price?: number;
  /** Checkout pricing snapshot (`order.bondDetails.pricing`) — preferred over bond DB amounts. */
  bondDetails?: { pricing?: Record<string, unknown> } | null;
  metadata?: {
    rfqNumber?: string;
    settlementOrderNumber?: string;
    dealId?: string;
    exchangeRfqId?: string;
    gender?: string;
    orderType?: string;
    accruedInterest?: number;
    /** No. of days for Accrued / Ex Interest */
    accruedInterestDays?: number;
    settlementDate?: string;
    payoutTime?: string;
    settlementDateTime?: string;
    valueDate?: string;
    lastInterestPaymentDate?: string;
    /** Settlement No. for page 2 */
    settlementNumber?: string;
    interestPaymentDates?: string[];
    interestPaymentFrequencyLabel?: string;
    settlementType: number;
    /** When true (default), Maturity Date row shows 100.0000%; when false, shows amortizedPrincipalPaymentDates */
    nonAmortizedBond?: boolean;
    amortizedPrincipalPaymentDates?: string;
    settleOrder?: {
      source?: number;
      settleStatus?: number;
      fundPayinRefId?: string;
      modQuantity?: number | string;
      modAccrInt?: number | string;
      modConsideration?: number | string;
      stampDutyAmount?: number | string;
    };
    /** CRM / RFQ: customer buy vs sell for wording */
    clientOrderSide?: "BUY" | "SELL";
    isRfqParticipant?: boolean;
  };
}

export default function OrdersPage({
  bond,
  user,
  orderId,
  qun,
  releasedOrder,
  orderData,
}: {
  user: CustomerByIdPayload;
  bond: BondDetailsResponse;
  orderId: string;
  qun: number;
  releasedOrder?: boolean;
  orderData?: OrderData;
}) {
  const fullname =
    user.firstName +
    `${user.middleName ? `${user.middleName} ` : " "}` +
    user.lastName;

  const dearGreeting = getPdfDearGreeting(user, orderData);

  // Calculate dates
  const now = new Date();
  const orderDate = orderData?.createdAt ? new Date(orderData.createdAt) : now;

  const dealDate = orderData?.createdAt
    ? new Date(orderData.createdAt ?? "")
    : new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow


  // Financials: settle_order → order checkout pricing snapshot (never bond DB calc columns)
  const {
    effectiveQty: effectiveQun,
    principalAmount,
    accruedInterest,
    accruedInterestDays,
    stampDutyAmount,
    totalConsideration,
    settlementAmount,
  } = resolveOrderPdfFinancials({
    orderData,
    qun,
    faceValue: Number(bond.faceValue) || null,
  });
  const faceValue = Number(bond.faceValue) || 1000;
  // Format amounts
  const formatCurrency = (amount: number, fixed = 2) => {
    return `${amount.toLocaleString("en-IN", {
      minimumFractionDigits: fixed,
      maximumFractionDigits: fixed,
    })}`;
  };

  const resolveYieldPct = (): string => {
    const fromPricing = orderData?.bondDetails?.pricing?.yield;
    const fromBond = bond.yield;
    const raw = fromPricing ?? fromBond;
    if (raw == null || raw === "") return "N/A";
    const n = typeof raw === "number" ? raw : Number(String(raw).replace(/,/g, "").trim());
    if (!Number.isFinite(n)) return "N/A";
    return `${n.toFixed(2)}%`;
  };
  const yieldDisplay = resolveYieldPct();

  // Payment day from Last Interest Payment Date (e.g. "16-Feb-2026 (Monday)" → 16)
  const lastInterestRaw = orderData?.metadata?.lastInterestPaymentDate?.trim();
  let paymentDayOfMonth = 20;
  if (lastInterestRaw) {
    const withoutDayName = lastInterestRaw.replace(/\s*\([^)]*\)\s*$/, "").trim();
    const match = withoutDayName.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
    if (match) {
      const [, dayStr, monthStr, yearStr] = match;
      const shortMonths: Record<string, number> = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
      };
      const m = shortMonths[monthStr ?? ""];
      if (m !== undefined) {
        const d = new Date(parseInt(yearStr ?? "0", 10), m, parseInt(dayStr ?? "1", 10));
        if (!isNaN(d.getTime())) paymentDayOfMonth = d.getDate();
      }
    } else {
      const d = new Date(withoutDayName);
      if (!isNaN(d.getTime())) paymentDayOfMonth = d.getDate();
    }
  }

  // Interest payment schedule from order date to maturity based on bond frequency
  const interestSchedule = getInterestPaymentSchedule({
    orderDate,
    maturityDate: bond.maturityDate ?? null,
    interestPaymentFrequency: bond.interestPaymentFrequency,
    paymentDayOfMonth,
    // When day came from Last Interest Payment Date, don't override with bond nextCouponDate
    nextCouponDate: lastInterestRaw
      ? undefined
      : bond.nextCouponDate != null && String(bond.nextCouponDate).trim() !== ""
        ? new Date(bond.nextCouponDate)
        : undefined,
  });

  const getInterestPaymentDatesDisplay = () => {
    // Prefer explicit Interest Payment Dates from CRM when provided; else use schedule (from Last Interest Payment Date day)
    if (orderData?.metadata?.interestPaymentDates?.length) {
      return Array.from(new Set(orderData.metadata.interestPaymentDates)).join(", ");
    }
    return Array.from(new Set(interestSchedule.dates)).join(", ");
  };



  const dealId =
    orderData?.metadata?.dealId ??
    (releasedOrder ? "—" : "XXXXXXXX");

  const txVerb =
    orderData?.metadata?.clientOrderSide === "SELL" ? "Sell" : "Buy";

  const list = [
    [
      "Transaction Type",
      `Your ${txVerb} (${fullname} : ${user?.panCard?.panCardNo || "N/A"})`,
    ],
    ["MeraDhan Order ID", !releasedOrder ? "XXXXXXXX" : orderId],
    [
      "Order Date & Time", !releasedOrder ? "XXXXXXXX" : `${formatDate(orderDate.toISOString(), "DD-MMM-YYYY")} ${String(
        orderDate.getHours()
      ).padStart(2, "0")}:${String(orderDate.getMinutes()).padStart(
        2,
        "0"
      )}:${String(orderDate.getSeconds()).padStart(2, "0")}`,
    ],

    ["MeraDhan Deal ID", !releasedOrder ? "XXXXXXXX" : dealId],
    [
      "Exchange RFQ Initiation ID",
      !releasedOrder ? "XXXXXXXX" : (orderData?.metadata?.settlementOrderNumber ||
        orderData?.metadata?.rfqNumber ||
        orderData?.metadata?.exchangeRfqId ||
        orderId ||
        (!releasedOrder ? "N/A" : "XXXXXXXX")),
    ],
    ["ISIN", bond.isin],
    ["Security Name", formatBondSecurityLabel(bond)],
    [
      "Coupon Rate",
      `${bond.couponRate.toFixed(2) || "N/A"}%`,
      `Yield: ${yieldDisplay}`,
    ],
    ["Face Value", `INR ${formatCurrency(faceValue)}`],
    [
      "Quantum",
      `INR ${formatCurrency(faceValue * effectiveQun)} (No. of Bonds: ${effectiveQun})`,
      `Clean Price: INR ${formatCurrency(orderData?.price || 0, 4)}`,
    ],
    [
      "Date",
      `Deal Date: ${formatDate(dealDate.toISOString(), "DD-MMM-YYYY")}`,
      `Settlement Date: ${formatDate(
        orderData?.metadata?.settlementDate ?? dealDate.toISOString(),
        "DD-MMM-YYYY",
      )}`,
    ],
    ["Name of OBPP", "BondNest Capital India Securities Private Limited"],
    [
      "Order Type",
      orderData?.metadata?.orderType ?? "N.A",
    ],
    [
      "Interest Payment Dates",
      bond.couponRate == 0 ? "NA (Zero Coupon Bond)" : `${orderData?.metadata?.interestPaymentFrequencyLabel ?? interestSchedule.frequencyLabel}
${getInterestPaymentDatesDisplay()}`,
    ],
    [
      "Last Interest Payment Date",
      (() => {
        const raw = orderData?.metadata?.lastInterestPaymentDate?.trim();
        if (raw) return formatLastInterestPaymentDateDisplay(raw);
        const bondLast =
          bond.lastCouponDate != null && String(bond.lastCouponDate).trim() !== ""
            ? String(bond.lastCouponDate).trim()
            : "";
        if (bondLast) return formatLastInterestPaymentDateDisplay(bondLast);
        return "N/A";
      })(),
    ],
    [
      "Allotment Date",
      bond.dateOfAllotment
        ? formatDate(bond.dateOfAllotment, "DD-MMM-YYYY")
        : "N/A",
    ],
    [
      "Maturity Date",
      (() => {
        if (!bond.maturityDate) return "N/A";
        const datePart = formatDate(bond.maturityDate, "DD-MMM-YYYY");
        const isNonAmortized = orderData?.metadata?.nonAmortizedBond !== false;
        const valuePart = isNonAmortized
          ? "100.0000%"
          : (orderData?.metadata?.amortizedPrincipalPaymentDates?.trim() || "100.0000%");
        return `${datePart} : ${valuePart}`;
      })(),
    ],
    [
      "Security Nature",
      ("natureOfInstrument" in bond
        ? (bond as { natureOfInstrument?: string }).natureOfInstrument
        : null) || "N.A",
    ],
    [
      "Put / Call Option",
      ("putCallOptionDetails" in bond
        ? (bond as { putCallOptionDetails?: string }).putCallOptionDetails
        : null) || "N.A / N.A",
    ],
    ["Principal Amount", `INR ${formatCurrency(totalConsideration - accruedInterest)}`],
    [
      "Accrued / Ex Interest",
      `${accruedInterest >= 0 ? `INR ${formatCurrency(accruedInterest)}` : `${`INR (${formatCurrency(accruedInterest)})`.replaceAll("-", "")}`}`,
    ],
    ["Total Consideration", `INR ${formatCurrency(totalConsideration)}`],
    [
      "Stamp Duty (To be paid by Buyer)",
      `INR ${formatCurrency(
        stampDutyAmount, 0
      )} (${numberToWords(stampDutyAmount)}) To be Retained by Exchange`,
    ],
    ["Brokerage / Convenience Charges", `INR ${formatCurrency(0)}`],
    [
      "Settlement Amount (inclusive of Stamp Duty)",
      `INR ${formatCurrency(settlementAmount)} (${numberToWords(settlementAmount)})`,
    ],

  ]

  const getITOMOde = () => {
    if (orderData?.metadata?.orderType?.includes("OTO")) {
      return `(One-to-One mode)`
    } else {
      return `(One-to-Many mode)`
    }
  }

  return (
    <View
      style={{
        paddingTop: 1,
        paddingRight: 35,
        paddingLeft: 35,
        fontSize: 7.5,
        fontFamily: "Poppins",
        marginTop: 10,
      }}
    >
      <View style={[styles.section, { paddingTop: 10, borderTopWidth: 1, borderTopColor: "#cccccc" }]}>
        <Text style={{ fontSize: 9 }}>
          Date: {formatDate(orderDate.toISOString(), "DD/MM/YYYY")}
        </Text>
      </View>

      {/* <View style={styles.section}>
        <Text style={{ fontSize: 9 }}>To,</Text>
        <Text style={{ fontSize: 9, fontWeight: "semibold" }}>
          {fullname} (PAN: {user?.panCard?.panCardNo})
        </Text>
      </View> */}

      <View style={styles.section}>
        <Text style={{ fontSize: 9 }}>{dearGreeting}</Text>
        <Text style={{
          fontSize: 9,
        }} >
          This {releasedOrder ? "" : "Draft"} Order Receipt has been
          automatically generated based on your authorization to MeraDhan, a
          platform by BondNest Capital India Securities Private Limited, to
          place a non-negotiable order {getITOMOde()} on the RFQ platform of
          the Stock Exchanges.
        </Text>
      </View>

      {list.map(([label, ...values], i) => (
        <View style={[styles.row, i === list.length - 1 ? { borderBottomWidth: 1, borderBottomColor: "#cccccc" } : {}]} key={i}>
          <Text style={[styles.leftLabel]}>{label}</Text>
          <View style={[{ marginLeft: 5 }, styles.rightValue]}>
            {Array.isArray(values) ? <View style={{ display: "flex", flexDirection: "row", gap: 2 }}>
              {
                values.map((value, index) => (
                  <View key={index} style={{
                    borderLeftWidth: index === 0 ? 0 : 1,
                    borderLeftColor: "#cccccc",
                    height: "100%",
                    width: 320,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                  }}  >
                    <Text style={{ fontSize: 9, ...(i === list.length - 1 ? { fontWeight: "semibold" } : {}) }} key={index}>
                      {value}
                    </Text>
                  </View>
                ))
              }

            </View> : <Text style={{ fontSize: 9, paddingVertical: 2, ...(i === list.length - 1 ? { fontWeight: "semibold" } : {}) }}>
              {values}
            </Text>}
          </View>
        </View>
      ))
      }
    </View >
  );
}

// Helper: convert number to words (Indian amount format: Crore, Lakh, Thousand)
function numberToWords(amount: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertHundreds(num: number): string {
    if (num === 0) return "";
    let result = "";
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10];
      return result.trim();
    }
    if (num > 0) {
      result += ones[num];
    }
    return result.trim();
  }

  const absAmount = Math.abs(amount);
  if (absAmount === 0) return "Rs. Zero Only";

  let rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  const parts: string[] = [];

  if (rupees >= 10000000) {
    const crore = Math.floor(rupees / 10000000);
    const word = convertHundreds(crore);
    if (word) parts.push(word + " Crore");
    rupees %= 10000000;
  }
  if (rupees >= 100000) {
    const lakh = Math.floor(rupees / 100000);
    const word = convertHundreds(lakh);
    if (word) parts.push(word + " Lakh");
    rupees %= 100000;
  }
  if (rupees >= 1000) {
    const thousand = Math.floor(rupees / 1000);
    const word = convertHundreds(thousand);
    if (word) parts.push(word + " Thousand");
    rupees %= 1000;
  }
  if (rupees > 0) {
    parts.push(convertHundreds(rupees));
  }

  let result = parts.join(" ").trim() || "Zero";
  result = "Rs. " + result + " Only";
  if (paise > 0) {
    result = result.replace(" Only", ` and ${convertHundreds(paise)} Paise Only`);
  }
  if (amount < 0) {
    result = "Minus " + result;
  }
  return result;
}
