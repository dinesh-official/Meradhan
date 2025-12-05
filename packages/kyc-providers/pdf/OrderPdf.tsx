import { Document, Page } from "@react-pdf/renderer";
import Footer from "./elements/Footer";
import LogoSvg from "./images/LogoSvg";
import OrdersPage from "./Orders/OrdersPage";

export function OrderPdf() {
  return (
    <Document>
      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg showAll={false} />
        <OrdersPage />
        <Footer />
      </Page>
    </Document>
  );
}
