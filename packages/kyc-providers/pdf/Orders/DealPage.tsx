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
    width: "33%",
    paddingVertical: 2,
    paddingHorizontal: 5,
    fontSize: 9,
  },
  rightValue: {
    width: "70%",
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
  };
}

export default function DealPage({
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

  const genderRaw = String(user?.gender ?? "").trim().toUpperCase();
  const salutation = genderRaw === "FEMALE" ? "Ms." : "Mr.";

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
    settleOrder?.stampDutyAmount ??
    orderData?.stampDuty ??
    principalAmount * 0.0001
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


  const topList = [
    [`Buyer: ${fullname.toUpperCase()}`, "Seller: BONDNEST CAPITAL INDIA SECURITIES PRIVATE LIMITED"],
    [
      `NCL Code: ${user.userName}`,
      "NCL Code: BCISLP"
    ],
    [
      `Kind Attention: ${fullname.toUpperCase()}`,
      "Kind Attention: BONDNEST CAPITAL INDIA SECURITIES PRIVATE LIMITED"
    ],
  ]


  const list = [
    ["Name of OBPP", "BondNest Capital India Securities Private Limited"],
    [
      `Order Type`,
      orderData?.metadata?.orderType ??
      "N.A",
    ],
    ["MeraDhan Order ID", orderId],
    ["MeraDhan Deal ID", dealId],
    ["ISIN", bond.isin],
    ["Security Name", bond.description],
    [
      "Security Nature",
      ("securityNature" in bond
        ? (bond as { securityNature?: string }).securityNature
        : null) || "Senior Secured",
    ],
    ["Coupon Rate", `${bond.couponRate.toFixed(2) || "N/A"} % `],
    [
      "Interest Payment Date",
      `${orderData?.metadata?.interestPaymentFrequencyLabel ?? interestSchedule.frequencyLabel}
${getInterestPaymentDatesDisplay()} `,
    ],
    [
      "Allotment Date",
      bond.dateOfAllotment
        ? formatDate(bond.dateOfAllotment, "DD-MMM-YYYY")
        : "N/A",
    ],
    [
      "Put / Call Option",
      ("putCallOption" in bond
        ? (bond as { putCallOption?: string }).putCallOption
        : null) || "N.A / N.A",
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
        return `${datePart} : ${valuePart} `;
      })(),
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
    ["Face Value", `INR ${formatCurrency(faceValue)} `],
    [
      "Quantum",
      `INR ${formatCurrency(faceValue * effectiveQun)} (No.of Bonds: ${effectiveQun})`,
      `Clean Price: INR ${formatCurrency(orderData?.price || 0, 4)} `,
    ],
    [
      "Date",
      `Deal Date: ${formatDate(dealDate.toISOString(), "DD-MMM-YYYY")} `,
      `Settlement Date: ${formatDate(orderData?.metadata?.settlementDate ? new Date(orderData.metadata.settlementDate).toISOString() : valueDate.toISOString(), "DD-MMM-YYYY")} `,
    ],
    ["Principal Amount", `INR ${formatCurrency(totalConsideration - accruedInterest)}`],
    [
      "Accrued / Ex Interest",
      `${accruedInterest >= 0 ? `INR ${formatCurrency(accruedInterest)} (No. of Days: ${orderData?.metadata?.accruedInterestDays || "N/A"})` : `${`INR (${formatCurrency(accruedInterest)})`.replaceAll("-", "")} (No. of Days: (${orderData?.metadata?.accruedInterestDays || "N/A"}))`}`,
    ],
    ["Total Consideration", `INR ${formatCurrency(totalConsideration)}`],
    [
      "Stamp Duty (To be paid by Buyer)",
      `INR ${formatCurrency(stampDutyAmount, 0)} (${numberToWords(stampDutyAmount)}) | To be Retained by Exchange`,
    ],
    ["Brokerage / Convenience Charges", `INR ${formatCurrency(0)} `],
    [
      "Settlement Amount (inclusive of Stamp Duty)",
      `INR ${formatCurrency(settlementAmount)} (${numberToWords(settlementAmount)})`,
    ],
    [
      "Order Date & Time",
      `${formatDate(orderDate.toISOString(), "DD-MMM-YYYY")} ${String(
        orderDate.getHours()
      ).padStart(2, "0")
      }:${String(orderDate.getMinutes()).padStart(
        2,
        "0"
      )
      }:${String(orderDate.getSeconds()).padStart(2, "0")} `,
    ],
    [
      "Exchange RFQ Initiation ID",
      orderData?.metadata?.settlementOrderNumber ||
      orderData?.metadata?.rfqNumber ||
      orderData?.metadata?.exchangeRfqId ||
      orderId ||
      (releasedOrder ? "N/A" : "Pending"),
    ],
    // ["Exchange RFQ Initiation ID", dealId],
    ["Exchange Order ID", orderData?.metadata?.rfqNumber || "N.A"],
    [
      "Settlement Date & Time",
      formatDate(dealDate.toISOString(), "DD-MMM-YYYY") + " " + String(dealDate.getHours()).padStart(2, "0") + ":" + String(dealDate.getMinutes()).padStart(2, "0") + ":" + String(dealDate.getSeconds()).padStart(2, "0")
    ],
  ]

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

      {topList.map(([label, ...values], i) => (
        <View style={[styles.row, i === topList.length - 1 ? { borderBottomWidth: 1, borderBottomColor: "#cccccc" } : {}]} key={i}>
          <Text style={[styles.leftLabel]}>{label}</Text>
          <View style={[{ marginLeft: 5 }, styles.rightValue]}>
            {Array.isArray(values) ? <View style={{ display: "flex", flexDirection: "row", gap: 2 }}>
              {
                values.map((value, index) => (
                  <View key={index} style={{
                    borderLeftWidth: index === 0 ? 0 : 1,
                    borderLeftColor: "#cccccc",
                    height: "100%",
                    width: 350,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                  }}  >
                    <Text style={{ fontSize: 9 }} key={index}>
                      {value}
                    </Text>
                  </View>
                ))
              }
            </View> : <Text style={{ fontSize: 9, paddingVertical: 2, ...(values === topList.length ? { fontWeight: "semibold" } : {}) }}>
              {values}
            </Text>}
          </View>
        </View>
      ))
      }


      <View style={[styles.section, { marginTop: 10 }]}>
        <Text style={{ fontSize: 9 }}>Dear {salutation} {fullname},</Text>
        <Text style={{
          fontSize: 9,
        }} >
          Please find below the transaction details:
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
                    width: 350,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                  }}  >
                    <Text style={{ fontSize: 9, ...(label?.includes("Settlement Amount") ? { fontWeight: "semibold" } : {}) }} key={index}>
                      {value}
                    </Text>
                  </View>
                ))
              }

            </View> : <Text style={{ fontSize: 9, paddingVertical: 2, }}>
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
  if (absAmount === 0) return "Zero Only";

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
