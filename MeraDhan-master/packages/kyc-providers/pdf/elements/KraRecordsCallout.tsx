import { StyleSheet, Text, View } from "@react-pdf/renderer";

/** Shown on PDF pages 1–2 when KYC used existing KRA data; sits above the footer. */
export type KraRecordsCalloutProps = {
  name: string;
  pan: string;
  retrievedAt: string;
};

export default function KraRecordsCallout({
  name,
  pan,
  retrievedAt,
}: KraRecordsCalloutProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.box}>
        <Text style={styles.title}>KYC DETAILS AS PER KRA RECORDS</Text>
        <Text style={styles.line}>Name: {name}</Text>
        <Text style={styles.line}>PAN: {pan}</Text>
        <Text style={styles.line}>Retrieved from KRA on: {retrievedAt}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    marginLeft: "200px",
    bottom: 85,
    fontFamily: "Poppins",
  },
  box: {
    width: "200px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#002C59",
    backgroundColor: "#E8F0FC",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  title: {
    fontSize: 9,
    fontWeight: 700,
    textAlign: "left",
    marginBottom: 6,
    color: "#000000",
  },
  line: {
    fontSize: 8,
    marginTop: 3,
    color: "#000000",
  },
});
