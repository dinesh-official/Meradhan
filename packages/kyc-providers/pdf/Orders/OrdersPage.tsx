import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type {
  BondDetailsResponse,
  CustomerByIdPayload,
} from "@root/apiGateway";
import { formatDate } from "../helper";
import { getInterestPaymentSchedule } from "./interestPaymentSchedule";

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
  metadata?: {
    rfqNumber?: string;
    settlementOrderNumber?: string;
    dealId?: string;
    exchangeRfqId?: string;
    orderType?: string;
    accruedInterest?: number;
    /** No. of days for Accrued / Ex Interest */
    accruedInterestDays?: number;
    settlementDate?: string;
    valueDate?: string;
    lastInterestPaymentDate?: string;
    /** Settlement No. for page 2 */
    settlementNumber?: string;
    interestPaymentDates?: string[];
    interestPaymentFrequencyLabel?: string;
    settleOrder?: {
      source?: number;
      settleStatus?: number;
      fundPayinRefId?: string;
      modQuantity?: number | string;
      modAccrInt?: number | string;
      modConsideration?: number | string;
      stampDutyAmount?: number | string;
    };
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

  // Calculate dates
  const now = new Date();
  const orderDate = orderData?.createdAt ? new Date(orderData.createdAt) : now;
  const dealDate = orderData?.metadata?.settlementDate
    ? new Date(orderData.metadata.settlementDate)
    : new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
  const valueDate = orderData?.metadata?.valueDate
    ? new Date(orderData.metadata.valueDate)
    : bond.maturityDate
      ? new Date(bond.maturityDate)
      : new Date(dealDate.getTime() + 24 * 60 * 60 * 1000); // Fallback: day after deal date

  // Calculate financials
  const faceValue = Number(bond.faceValue) || 1000;
  const settleOrder = orderData?.metadata?.settleOrder;
  const effectiveQun =
    settleOrder?.modQuantity != null ? Number(settleOrder.modQuantity) : qun;

  const principalAmount = faceValue * effectiveQun; // Convert to actual amount
  const accruedInterest =
    Number(
      settleOrder?.modAccrInt ??
      orderData?.metadata?.accruedInterest ??
      (principalAmount * 0.01 * 9) / 365
    ); // Rough calculation if not provided
  // const stampDutyAmount = orderData?.stampDuty || principalAmount * 0.0001; // 0.01% stamp duty
  const stampDutyAmount = Number(
    settleOrder?.stampDutyAmount ?? orderData?.stampDuty ?? 0
  );

  const totalConsideration =
    Number(
      settleOrder?.modConsideration ??
      orderData?.totalAmount ??
      principalAmount + accruedInterest
    );
  const settlementAmount = totalConsideration + stampDutyAmount;



  // Format amounts
  const formatCurrency = (amount: number, fixed = 2) => {
    return `${amount.toLocaleString("en-IN", {
      minimumFractionDigits: fixed,
      maximumFractionDigits: fixed,
    })}`;
  };

  // Interest payment schedule from order date to maturity based on bond frequency
  const interestSchedule = getInterestPaymentSchedule({
    orderDate,
    maturityDate: bond.maturityDate ?? null,
    interestPaymentFrequency: bond.interestPaymentFrequency,
    paymentDayOfMonth: 20,
    nextCouponDate:
      bond.nextCouponDate != null && String(bond.nextCouponDate).trim() !== ""
        ? new Date(bond.nextCouponDate)
        : undefined,
  });

  const getInterestPaymentDatesDisplay = () => {
    if (orderData?.metadata?.interestPaymentDates?.length) {
      return Array.from(new Set(orderData.metadata.interestPaymentDates)).join(", ");
    }
    return Array.from(new Set(interestSchedule.dates)).join(", ");
  };



  // Get deal ID from metadata or generate from order
  const dealId =
    orderData?.metadata?.dealId ||
    `MD-${orderId.split("-").pop() || "XXXXX"}-${formatDate(
      orderDate.toISOString(),
      "DD/MM/YYYY"
    ).replace(/\//g, "")}-BUY-${String(orderDate.getHours()).padStart(
      2,
      "0"
    )}${String(orderDate.getMinutes()).padStart(2, "0")}${String(
      orderDate.getSeconds()
    ).padStart(2, "0")}`;


  const list = [
    ["MeraDhan Order ID", orderId],
    [
      "Order Date & Time",
      `${formatDate(orderDate.toISOString(), "DD-MMM-YYYY")} ${String(
        orderDate.getHours()
      ).padStart(2, "0")}:${String(orderDate.getMinutes()).padStart(
        2,
        "0"
      )}:${String(orderDate.getSeconds()).padStart(2, "0")}`,
    ],
    [
      "Exchange RFQ Initiation ID",
      orderData?.metadata?.settlementOrderNumber ||
      orderData?.metadata?.rfqNumber ||
      orderData?.metadata?.exchangeRfqId ||
      orderId ||
      (releasedOrder ? "N/A" : "Pending"),
    ],
    ["MeraDhan Deal ID", dealId],
    [
      "Transaction Type",
      `Your Buy (${fullname} : ${user?.panCard?.panCardNo || "N/A"})`,
    ],
    ["ISIN", bond.isin],
    ["Security Name", bond.bondName],
    ["Coupon Rate", `${bond.couponRate.toFixed(2) || "N/A"}%`],
    ["Face Value", `INR ${formatCurrency(faceValue)}`],
    [
      "Quantum",
      `INR ${formatCurrency(faceValue)} (No. of Bonds: ${effectiveQun})`,
      `Price: INR ${formatCurrency(orderData?.price || 0, 4)}`,
    ],
    [
      "Date",
      `Deal Date: ${formatDate(dealDate.toISOString(), "DD-MMM-YYYY")}`,
      `Value Date: ${formatDate(valueDate.toISOString(), "DD-MMM-YYYY")}`,
    ],
    ["Name of OBPP", "BondNest Capital India Securities Private Limited"],
    [
      "Order Type",
      orderData?.metadata?.orderType ?? "N.A",
    ],
    [
      "Interest Payment Dates",
      `${orderData?.metadata?.interestPaymentFrequencyLabel ?? interestSchedule.frequencyLabel}
${getInterestPaymentDatesDisplay()}`,
    ],
    [
      "Last Interest Payment Date",
      (() => {
        const raw = orderData?.metadata?.lastInterestPaymentDate?.trim();
        if (raw) return raw;
        const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return formatDate(d.toISOString(), "DD-MMM-YYYY") + ` (${dayNames[d.getDay()]})`;
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
      bond.maturityDate
        ? formatDate(bond.maturityDate, "DD-MMM-YYYY") + " : 100.0000%"
        : "N/A",
    ],
    [
      "Security Nature",
      ("securityNature" in bond
        ? (bond as { securityNature?: string }).securityNature
        : null) || "Senior Secured",
    ],
    [
      "Put / Call Option",
      ("putCallOption" in bond
        ? (bond as { putCallOption?: string }).putCallOption
        : null) || "N.A / N.A",
    ],
    ["Principal Amount", `INR ${formatCurrency(settlementAmount)}`],
    [
      "Accrued / Ex Interest",
      `${accruedInterest >= 0 ? `INR ${formatCurrency(accruedInterest)}` : `INR (${formatCurrency(accruedInterest)})`.replaceAll("-", "")} ` + `(No. of Days: (${orderData?.metadata?.accruedInterestDays ??
      Math.ceil((now.getTime() - (orderData?.metadata?.lastInterestPaymentDate ? new Date(orderData.metadata.lastInterestPaymentDate).getTime() : now.getTime() - 30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000))
      }))`,
    ],
    ["Total Consideration", `INR ${formatCurrency(settlementAmount + accruedInterest)}`],
    [
      "Stamp Duty (To be paid by Buyer)",
      `INR ${formatCurrency(
        stampDutyAmount, 0
      )} (${numberToWords(stampDutyAmount)}) | To be Retained by Exchange`,
    ],
    ["Brokerage / Convenience Charges", `INR ${formatCurrency(0)}`],
    [
      "Settlement Amount (inclusive of Stamp Duty)",
      `INR ${formatCurrency(settlementAmount + accruedInterest + stampDutyAmount)} (${numberToWords(settlementAmount + accruedInterest + stampDutyAmount)})`,
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
        <Text style={{ fontSize: 9, fontWeight: "semibold" }}>
          Date: {formatDate(orderDate.toISOString(), "DD/MM/YYYY")}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 9 }}>To,</Text>
        <Text style={{ fontSize: 9, fontWeight: "semibold" }}>
          {fullname} (PAN: {user?.panCard?.panCardNo})
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 9 }}>Dear Sir / Madam,</Text>
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
