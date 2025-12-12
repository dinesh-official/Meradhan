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

export default function OrdersPage({
  bond,
  user,
  orderId,
  qun,
  releasedOrder,
}: {
  user: CustomerByIdPayload;
  bond: BondDetailsResponse;
  orderId: string;
  qun: number;
  releasedOrder?: boolean;
}) {
  const fullname =
    user.firstName +
    `${user.middleName ? `${user.middleName} ` : " "}` +
    user.lastName;
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
        <Text style={styles.bold}>Date: 27/11/2025</Text>
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
          This ${releasedOrder ? "" : "Draft"} Order Receipt has been
          automatically generated based on your authorization to MeraDhan, a
          platform by BondNest Capital India Securities Private Limited, to
          place a non-negotiable order (One-to-One mode) on the RFQ platform of
          the Stock Exchanges.
        </Text>
      </View>

      {[
        ["MeraDhan Order ID", orderId],
        ["Order Date & Time", "XXXXXX"],
        ["Exchange RFQ Initiation ID", "XXXXXX"],
        ["MeraDhan Deal ID", "MD-AKCF1-01-DIR-27112025-BUY-131526"],
        [
          "Transaction Type",
          `Your Buy (${fullname} : ${user?.panCard?.panCardNo})`,
        ],
        ["ISIN", bond.isin],
        ["Security Name", bond.bondName],
        ["Coupon Rate", bond.couponRate + "%"],
        ["Face Value", "INR " + bond.faceValue.toLocaleString("en-IN")],
        [
          "Quantum",
          `INR ${bond.faceValue} (No. of Bonds: ${qun})`,
          `Price: INR ${bond.faceValue * qun}`,
        ],
        ["Date", "Deal Date: 27 Nov 2025", "Value Date: 28 Nov 2025"],
        ["Name of OBPP", "BondNest Capital India Securities Private Limited"],
        ["Order Type", "One To One (OTO) on RFQ Platform of the Exchange"],
        [
          "Interest Payment Dates",
          `Twelve Times a Year - ${new Date().getDay()}-Dec, ${new Date().getDay()}-Jan, ${new Date().getDay()}-Feb, ${new Date().getDay()}-Mar, ${new Date().getDay()}-Apr, ${new Date().getDay()}-May, ${new Date().getDay()}-Jun, ${new Date().getDay()}-Jul, ${new Date().getDay()}-Aug, ${new Date().getDay()}-Sep, ${new Date().getDay()}-Oct, ${new Date().getDay()}-Nov`,
        ],
        ["Last Interest Payment Date", "19 Nov 2025 (Wednesday)"],
        ["Allotment Date", formatDate(bond.dateOfAllotment, "DD Month YYYY")],
        [
          "Maturity Date",
          formatDate(bond.maturityDate, "DD Month YYYY") + " : 100.0000%",
        ],
        ["Security Nature", "Senior Secured"],
        ["Put / Call Option", "N.A / N.A"],
        ["Principal Amount", "INR 9,997.50"],
        ["Accrued / Ex Interest", "INR 26.51 (No. of Days: 9)"],
        ["Total Consideration", "INR 10,024.01"],
        [
          "Stamp Duty (To be paid by Buyer)",
          "INR 0.00 (as per NIL) | To be Retaliated by Exchange",
        ],
        ["Brokerage / Convenience Charges", "INR 0.00"],
        [
          "Settlement Amount (inclusive of Stamp Duty)",
          "INR 10,024.01 (Rs. Ten Thousand Twenty Four and One Paisa Only)",
        ],
      ].map(([label, value], i) => (
        <View style={styles.row} key={i}>
          <Text style={styles.leftLabel}>{label}</Text>
          <Text style={[{ marginLeft: 5 }, styles.rightValue]}>{value}</Text>
        </View>
      ))}
    </View>
  );
}
