import { Text, View, StyleSheet } from "@react-pdf/renderer";

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

export default function OrdersPage() {
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
        <Text style={styles.bold}>AJAY MOHANLAL MAHAJAN (PAN: AADPM2907K)</Text>
      </View>

      <View style={styles.section}>
        <Text>Dear Sir / Madam,</Text>
        <Text>
          This Order Receipt has been automatically generated based on your
          authorization to MeraDhan, a platform by BondNest Capital India
          Securities Private Limited, to place a non-negotiable order
          (One-to-One mode) on the RFQ platform of the Stock Exchanges.
        </Text>
      </View>

      {[
        ["MeraDhan Order ID", "MD-DIR-27112025-BUY-127703"],
        ["Order Date & Time", "XXXXXX"],
        ["Exchange RFQ Initiation ID", "XXXXXX"],
        ["MeraDhan Deal ID", "MD-AKCF1-01-DIR-27112025-BUY-131526"],
        ["Transaction Type", "Your Buy (AJAY MOHANLAL MAHAJAN : AADPM2907K)"],
        ["ISIN", "INE3427O7601"],
        ["Security Name", "NAVI FINSERV LIMITED 10.75 NCD 19AG28 FVRS10000"],
        ["Coupon Rate", "10.7500%"],
        ["Face Value", "INR 10,000.00"],
        ["Quantum", "INR 10,000.00 (No. of Bonds: 1)", "Price: INR 99.9750"],
        ["Date", "Deal Date: 27 Nov 2025", "Value Date: 28 Nov 2025"],
        ["Name of OBPP", "BondNest Capital India Securities Private Limited"],
        ["Order Type", "One To One (OTO) on RFQ Platform of the Exchange"],
        [
          "Interest Payment Dates",
          "Twelve Times a Year - 19-Dec, 19-Jan, 19-Feb, 19-Mar, 19-Apr, 19-May, 19-Jun, 19-Jul, 19-Aug, 19-Sep, 19-Oct, 19-Nov",
        ],
        ["Last Interest Payment Date", "19 Nov 2025 (Wednesday)"],
        ["Allotment Date", "19 Jun 2025"],
        ["Maturity Date", "19 Aug 2028 : 100.0000%"],
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
