import { Document, Page } from "@react-pdf/renderer";
import Footer from "./elements/Footer";
import LogoSvg from "./images/LogoSvg";
import OrdersPage from "./Orders/OrdersPage";
import OrdersPageTwo from "./Orders/OrdersPageTwo";

export function OrderPdf() {
  return (
    <Document>
      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg showAll={false} />
        <OrdersPage />
        <Footer />
      </Page>
      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg showAll={false} />
        <OrdersPageTwo />
        <Footer />
      </Page>
    </Document>
  );
}
