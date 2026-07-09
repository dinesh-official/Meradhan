import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";

const Footer = () => {
  return (
    <View style={styles.footerContainer}>
      <View style={styles.footer}>
        <Text style={tw(`text-[8px]`)}>
          SEBI Registration No.: INZ000330234
        </Text>
        <Text style={tw(`text-[8px]`)}>BSE Member ID: 6963</Text>
        <Text style={tw(`text-[8px]`)}>NSE Member ID: 90480 </Text>
        <Text style={tw(`text-[8px]`)}>CIN: U66190MH2025PTC441753</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 5,
    paddingHorizontal: 40,
    fontFamily: "Poppins",
  },
  footer: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    textAlign: "center", // keeps footer text centered
    borderTop: 1,
    paddingVertical: 15,
    paddingTop: 10,
    borderColor: "#cccccc",
  },
});

export default Footer;
