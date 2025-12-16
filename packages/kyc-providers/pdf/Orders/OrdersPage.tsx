import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type {
  BondDetailsResponse,
  CustomerByIdPayload,
} from "@root/apiGateway";
import { formatDate } from "../helper";

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
    paddingVertical: 4,
    borderTopWidth: 1,
    borderColor: "#cccccc",
  },
  leftLabel: {
    width: "25%",
  },
  rightValue: {
    width: "68%",
    textAlign: "left",
  },
});

interface OrderData {
  subTotal?: number;
  stampDuty?: number;
  totalAmount?: number;
  createdAt?: string;
  metadata?: {
    rfqNumber?: string;
    dealId?: string;
    exchangeRfqId?: string;
    accruedInterest?: number;
    settlementDate?: string;
    valueDate?: string;
    lastInterestPaymentDate?: string;
    interestPaymentDates?: string[];
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
    : new Date(dealDate.getTime() + 24 * 60 * 60 * 1000); // Day after deal date

  // Calculate financials
  const faceValue = Number(bond.faceValue) || 1000;
  const unitPrice = Number(bond.faceValue) || 1000;

  const principalAmount = faceValue * qun; // Convert to actual amount
  const accruedInterest =
    orderData?.metadata?.accruedInterest || (principalAmount * 0.01 * 9) / 365; // Rough calculation if not provided
  // const stampDutyAmount = orderData?.stampDuty || principalAmount * 0.0001; // 0.01% stamp duty
  const stampDutyAmount = orderData?.stampDuty || principalAmount * 0.0001; // 0.01% stamp duty

  const totalConsideration =
    orderData?.totalAmount || principalAmount + accruedInterest;
  const settlementAmount = totalConsideration + stampDutyAmount;

  // Format amounts
  const formatCurrency = (amount: number) => {
    return `INR ${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Generate interest payment dates (monthly)
  const getInterestPaymentDates = () => {
    if (orderData?.metadata?.interestPaymentDates) {
      return orderData.metadata.interestPaymentDates.join(", ");
    }
    const dates: string[] = [];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const startMonth = now.getMonth();
    for (let i = 0; i < 12; i++) {
      const monthIndex = (startMonth + i) % 12;
      dates.push(`${now.getDate()}-${months[monthIndex]}`);
    }
    return dates.join(", ");
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

  return (
    <View
      style={{
        paddingTop: 1,
        paddingRight: 35,
        paddingLeft: 35,
        fontSize: 7.5,
        fontFamily: "Poppins",
      }}
    >
      <View style={styles.section}>
        <Text style={styles.bold}>
          Date: {formatDate(orderDate.toISOString(), "DD/MM/YYYY")}
        </Text>
      </View>

      <View style={styles.section}>
        <Text>To,</Text>
        <Text style={styles.bold}>
          {fullname} (PAN: {user?.panCard?.panCardNo})
        </Text>
      </View>

      <View style={styles.section}>
        <Text>Dear Sir / Madam,</Text>
        <Text>
          This {releasedOrder ? "" : "Draft"} Order Receipt has been
          automatically generated based on your authorization to MeraDhan, a
          platform by BondNest Capital India Securities Private Limited, to
          place a non-negotiable order (One-to-One mode) on the RFQ platform of
          the Stock Exchanges.
        </Text>
      </View>

      {[
        ["MeraDhan Order ID", orderId],
        [
          "Order Date & Time",
          `${formatDate(
            orderDate.toISOString(),
            "DD/MM/YYYY"
          )} ${orderDate.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })} IST`,
        ],
        [
          "Exchange RFQ Initiation ID",
          orderData?.metadata?.exchangeRfqId ||
            orderData?.metadata?.rfqNumber ||
            (releasedOrder ? "N/A" : "Pending"),
        ],
        ["MeraDhan Deal ID", dealId],
        [
          "Transaction Type",
          `Your Buy (${fullname} : ${user?.panCard?.panCardNo || "N/A"})`,
        ],
        ["ISIN", bond.isin],
        ["Security Name", bond.bondName],
        ["Coupon Rate", `${bond.couponRate || "N/A"}%`],
        ["Face Value", formatCurrency(faceValue)],
        [
          "Quantum",
          `${formatCurrency(faceValue)} (No. of Bonds: ${qun})`,
          `Price: ${formatCurrency(unitPrice * qun)}`,
        ],
        [
          "Date",
          `Deal Date: ${formatDate(dealDate.toISOString(), "DD Month YYYY")}`,
          `Value Date: ${formatDate(valueDate.toISOString(), "DD Month YYYY")}`,
        ],
        ["Name of OBPP", "BondNest Capital India Securities Private Limited"],
        ["Order Type", "One To One (OTO) on RFQ Platform of the Exchange"],
        [
          "Interest Payment Dates",
          `Twelve Times a Year - ${getInterestPaymentDates()}`,
        ],
        [
          "Last Interest Payment Date",
          orderData?.metadata?.lastInterestPaymentDate ||
            formatDate(
              new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              "DD Month YYYY"
            ) + " (Wednesday)",
        ],
        [
          "Allotment Date",
          bond.dateOfAllotment
            ? formatDate(bond.dateOfAllotment, "DD Month YYYY")
            : "N/A",
        ],
        [
          "Maturity Date",
          bond.maturityDate
            ? formatDate(bond.maturityDate, "DD Month YYYY") + " : 100.0000%"
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
        ["Principal Amount", formatCurrency(principalAmount)],
        [
          "Accrued / Ex Interest",
          `${formatCurrency(accruedInterest)} (No. of Days: ${Math.ceil(
            (now.getTime() -
              (orderData?.metadata?.lastInterestPaymentDate
                ? new Date(orderData.metadata.lastInterestPaymentDate).getTime()
                : now.getTime() - 30 * 24 * 60 * 60 * 1000)) /
              (24 * 60 * 60 * 1000)
          )})`,
        ],
        ["Total Consideration", formatCurrency(totalConsideration)],
        [
          "Stamp Duty (To be paid by Buyer)",
          `${formatCurrency(
            stampDutyAmount
          )} (as per NIL) | To be Retaliated by Exchange`,
        ],
        ["Brokerage / Convenience Charges", formatCurrency(0)],
        [
          "Settlement Amount (inclusive of Stamp Duty)",
          `${formatCurrency(settlementAmount)} (${numberToWords(
            settlementAmount
          )})`,
        ],
      ].map(([label, ...values], i) => (
        <View style={styles.row} key={i}>
          <Text style={styles.leftLabel}>{label}</Text>
          <Text style={[{ marginLeft: 5 }, styles.rightValue]}>
            {Array.isArray(values) ? values.join(", ") : values}
          </Text>
        </View>
      ))}
    </View>
  );
}

// Helper function to convert number to words
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
    let result = "";
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10] + " ";
      return result.trim();
    }
    if (num > 0) {
      result += ones[num] + " ";
    }
    return result.trim();
  }

  if (amount === 0) return "Zero Only";

  let rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = "Rs. ";
  if (rupees >= 10000000) {
    result += convertHundreds(Math.floor(rupees / 10000000)) + "Crore ";
    rupees %= 10000000;
  }
  if (rupees >= 100000) {
    result += convertHundreds(Math.floor(rupees / 100000)) + "Lakh ";
    rupees %= 100000;
  }
  if (rupees >= 1000) {
    result += convertHundreds(Math.floor(rupees / 1000)) + "Thousand ";
    rupees %= 1000;
  }
  if (rupees > 0) {
    result += convertHundreds(rupees);
  }

  result = result.trim() + " Only";
  if (paise > 0) {
    result += ` and ${convertHundreds(paise)} Paisa`;
  }

  return result;
}
